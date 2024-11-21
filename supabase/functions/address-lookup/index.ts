import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client for each request
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get fresh API credentials from the database for each request
    const { data: credentials, error: credentialsError } = await supabaseClient
      .from('api_credentials')
      .select('*')
      .limit(1)
      .single()

    if (credentialsError) {
      throw new Error('Failed to fetch API credentials')
    }

    // Get search parameters from request
    const { searchType, searchTerm, zipCode } = await req.json()

    // Prepare the request body based on search type
    const requestBody = {
      request: {
        ONRP: 0,
        ZipCode: searchType === 'zip' ? searchTerm : zipCode || '',
        ZipAddition: '',
        TownName: searchType === 'zip' ? '' : '',
        STRID: 0,
        StreetName: searchType === 'street' ? searchTerm : '',
        HouseKey: 0,
        HouseNo: '',
        HouseNoAddition: ''
      },
      zipOrderMode: 0,
      zipFilterMode: 0
    }

    // Construct API request URL
    const apiUrl = 'https://webservices.post.ch:17023/IN_SYNSYN_EXT/REST/v1/autocomplete4'
    
    console.log('Making request to Swiss Post API:', {
      url: apiUrl,
      searchType,
      searchTerm,
      zipCode
    })

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      console.error('API request failed:', {
        status: response.status,
        statusText: response.statusText
      })
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('API response received:', data)

    // Transform the response to match our existing format
    const transformedData = searchType === 'zip' 
      ? {
          zips: data.suggestions?.map(item => ({
            zip: item.ZipCode,
            city18: item.TownName,
            city27: item.TownName,
            city39: item.TownName
          })) || []
        }
      : {
          streets: data.suggestions?.map(item => ({
            STRID: item.STRID,
            streetName: item.StreetName,
            zipCode: item.ZipCode,
            city: item.TownName,
            houseNumbers: item.houseNumbers
          })) || []
        }

    return new Response(
      JSON.stringify(transformedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})