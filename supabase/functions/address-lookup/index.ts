import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const config = {
  zipFilter: {
    cantons: {
      ZG: {
        enabled: true,
        zipCodes: [
          "6300", "6301", "6302", "6303", "6312", "6313", 
          "6314", "6315", "6317", "6318", "6319", "6330", 
          "6331", "6332", "6333", "6340", "6341", "6343", "6345"
        ]
      }
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: credentials, error: credentialsError } = await supabaseClient
      .from('api_credentials')
      .select('*')
      .limit(1)
      .single()

    if (credentialsError) {
      console.error('Failed to fetch API credentials:', credentialsError)
      throw new Error('Failed to fetch API credentials')
    }

    const { type: searchType, searchTerm } = await req.json()

    // Create two request bodies - one for ZIP search and one for city search
    const zipRequestBody = {
      request: {
        ONRP: 0,
        ZipCode: searchTerm,
        ZipAddition: '',
        TownName: '',
        STRID: 0,
        StreetName: '',
        HouseKey: 0,
        HouseNo: '',
        HouseNoAddition: ''
      },
      zipOrderMode: 0,
      zipFilterMode: 0
    }

    const cityRequestBody = {
      request: {
        ONRP: 0,
        ZipCode: '',
        ZipAddition: '',
        TownName: searchTerm,
        STRID: 0,
        StreetName: '',
        HouseKey: 0,
        HouseNo: '',
        HouseNoAddition: ''
      },
      zipOrderMode: 0,
      zipFilterMode: 0
    }

    const apiUrl = 'https://webservices.post.ch:17023/IN_SYNSYN_EXT/REST/v1/autocomplete4'
    
    // Make both requests in parallel
    const [zipResponse, cityResponse] = await Promise.all([
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
        },
        body: JSON.stringify(zipRequestBody)
      }),
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
        },
        body: JSON.stringify(cityRequestBody)
      })
    ])

    if (!zipResponse.ok || !cityResponse.ok) {
      const errorText = await zipResponse.text()
      console.error('API request failed:', {
        zipStatus: zipResponse.status,
        cityStatus: cityResponse.status,
        error: errorText
      })
      throw new Error(`API request failed`)
    }

    const [zipData, cityData] = await Promise.all([
      zipResponse.json(),
      cityResponse.json()
    ])

    // Combine and deduplicate results
    const combinedResults = {
      QueryAutoComplete4Result: {
        AutoCompleteResult: [
          ...(zipData.QueryAutoComplete4Result?.AutoCompleteResult || []),
          ...(cityData.QueryAutoComplete4Result?.AutoCompleteResult || [])
        ]
      }
    }

    // Remove duplicates based on ZipCode and TownName combination
    const uniqueResults = {
      QueryAutoComplete4Result: {
        AutoCompleteResult: Array.from(
          new Map(
            combinedResults.QueryAutoComplete4Result.AutoCompleteResult.map(item => 
              [`${item.ZipCode}-${item.TownName}`, item]
            )
          ).values()
        )
      }
    }

    // Filter results based on canton ZIP codes
    const filterResults = (data) => {
      if (!config.zipFilter.cantons.ZG.enabled) return data;

      const allowedZipCodes = config.zipFilter.cantons.ZG.zipCodes;

      return {
        QueryAutoComplete4Result: {
          AutoCompleteResult: data.QueryAutoComplete4Result?.AutoCompleteResult?.filter(item => 
            allowedZipCodes.includes(item.ZipCode)
          ) || []
        }
      };
    };

    const filteredData = filterResults(uniqueResults);

    return new Response(
      JSON.stringify(filteredData),
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