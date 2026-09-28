import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { compareStreets } from './sort.ts'
import {
  MAX_BODY_BYTES,
  clientIp,
  corsHeadersFor,
  parseAllowedOrigins,
  parseLookupRequest,
} from './request.ts'

const DEFAULT_ALLOWED_ORIGINS = 'https://wartgeld-generator-zug.netlify.app,http://localhost:8080'
const allowedOrigins = parseAllowedOrigins(Deno.env.get('ALLOWED_ORIGINS') ?? DEFAULT_ALLOWED_ORIGINS)

// Per client IP, and a global ceiling that protects the Swiss Post quota if IPs rotate.
const IP_LIMIT = { max: Number(Deno.env.get('RATE_LIMIT_PER_MINUTE') ?? 60), windowSeconds: 60 }
const GLOBAL_LIMIT = { max: Number(Deno.env.get('RATE_LIMIT_GLOBAL_PER_HOUR') ?? 3000), windowSeconds: 3600 }

const CACHE_TTL_MS = 10 * 60 * 1000

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const parseAddressInput = (input: string) => {
  const zipCityPattern = /(\d{4})\s+([^,]+)/;
  const houseNumberPattern = /(\d+[a-zA-Z]?)\s*$/;
  
  let streetName = input;
  let houseNumber = '';
  let addition = '';
  let zipCode = '';
  let city = '';

  const zipCityMatch = input.match(zipCityPattern);
  if (zipCityMatch) {
    zipCode = zipCityMatch[1];
    city = zipCityMatch[2].trim();
    streetName = input.replace(zipCityPattern, '').trim();
  }

  const houseNumberMatch = streetName.match(houseNumberPattern);
  if (houseNumberMatch) {
    const fullNumber = houseNumberMatch[1];
    const numberMatch = fullNumber.match(/(\d+)([a-zA-Z])?/);
    if (numberMatch) {
      houseNumber = numberMatch[1];
      addition = numberMatch[2] || '';
      streetName = streetName.replace(houseNumberPattern, '').trim();
    }
  }

  return { streetName, houseNumber, addition, zipCode, city };
};

// ZIP codes and Post credentials change rarely; keep them per function instance.
interface Config {
  allowedZipCodes: string[]
  credentials: { username: string; password: string }
  loadedAt: number
}
let cachedConfig: Config | null = null

const loadConfig = async (): Promise<Config> => {
  if (cachedConfig && Date.now() - cachedConfig.loadedAt < CACHE_TTL_MS) return cachedConfig

  const { data: canton, error: cantonError } = await supabaseClient
    .from('cantons')
    .select('id')
    .eq('code', 'ZG')
    .eq('enabled', true)
    .single()
  if (cantonError) throw cantonError

  const { data: zipCodesData, error: zipCodesError } = await supabaseClient
    .from('canton_zip_codes')
    .select('zip_code')
    .eq('canton_id', canton.id)
  if (zipCodesError) throw zipCodesError

  const { data: credentials, error: credentialsError } = await supabaseClient
    .from('api_credentials')
    .select('username, password')
    .limit(1)
    .single()
  if (credentialsError || !credentials) throw new Error('Failed to fetch API credentials')

  cachedConfig = {
    allowedZipCodes: zipCodesData.map((row: { zip_code: string }) => row.zip_code),
    credentials,
    loadedAt: Date.now(),
  }
  return cachedConfig
}

const sha256 = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
}

/** Counts this request against a fixed-window limit; true while under the limit. */
const withinRateLimit = async (clientKey: string, limit: { max: number; windowSeconds: number }) => {
  const { data, error } = await supabaseClient.rpc('check_rate_limit', {
    p_client_key: clientKey,
    p_max_requests: limit.max,
    p_window_seconds: limit.windowSeconds,
  })
  if (error) throw error
  return data === true
}

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req.headers.get('origin'), allowedOrigins)
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...(corsHeaders ?? {}), 'Content-Type': 'application/json' },
    })

  if (!corsHeaders) return json({ error: 'Origin not allowed' }, 403)
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const startedAt = Date.now()
  try {
    const rawBody = await req.text()
    if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
      return json({ error: 'Request too large' }, 413)
    }
    let body: unknown
    try {
      body = JSON.parse(rawBody)
    } catch {
      return json({ error: 'Invalid JSON' }, 400)
    }
    const parsed = parseLookupRequest(body)
    if (!parsed.ok) return json({ error: parsed.error }, 400)

    const ipKey = `ip:${await sha256(clientIp(req.headers.get('x-forwarded-for')))}`
    if (!(await withinRateLimit(ipKey, IP_LIMIT)) || !(await withinRateLimit('global', GLOBAL_LIMIT))) {
      console.warn('Rate limit exceeded')
      return json({ error: 'Too many requests' }, 429)
    }

    const { type: searchType, searchTerm, zipCode: filterZipCode } = parsed.value
    const { streetName, houseNumber, addition, zipCode, city } = parseAddressInput(searchTerm)

    const effectiveSearchType = searchType || (() => {
      if (zipCode) return 'zip';
      if (city) return 'city';
      return 'street';
    })();

    const requestBody = {
      request: {
        ONRP: 0,
        ZipCode: effectiveSearchType === 'zip' ? searchTerm : zipCode || (filterZipCode || "63"),
        ZipAddition: '',
        TownName: effectiveSearchType === 'city' ? searchTerm : city,
        STRID: 0,
        StreetName: effectiveSearchType === 'street' ? streetName : '',
        HouseKey: 0,
        HouseNo: houseNumber,
        HouseNoAddition: addition
      },
      zipOrderMode: 0,
      zipFilterMode: 0
    }

    const { allowedZipCodes, credentials } = await loadConfig()

    const apiUrl = 'https://webservices.post.ch:17023/IN_SYNSYN_EXT/REST/v1/autocomplete4'
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    const results = data.QueryAutoComplete4Result?.AutoCompleteResult || [];

    const validResults = results
      .filter((item: { StreetName?: string; ZipCode?: string }) => {
        if (!item.StreetName?.trim() || !item.ZipCode?.trim()) {
          return false;
        }
        return allowedZipCodes.includes(item.ZipCode);
      })
      .sort(compareStreets(streetName));

    // No request or response bodies in the logs: they contain addresses.
    console.log(`address-lookup ok: ${validResults.length}/${results.length} results in ${Date.now() - startedAt} ms`)

    return json({
      QueryAutoComplete4Result: {
        AutoCompleteResult: validResults
      }
    })
  } catch (error) {
    console.error('address-lookup failed:', error instanceof Error ? error.message : error)
    return json({ error: 'Address lookup failed' }, 500)
  }
})
