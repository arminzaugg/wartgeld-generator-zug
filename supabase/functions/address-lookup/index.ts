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

    // Create request body based on search type
    const requestBody = {
      request: {
        ONRP: 0,
        ZipCode: searchType === 'zip' ? searchTerm : '',
        ZipAddition: '',
        TownName: searchType === 'city' ? searchTerm : '',
        STRID: 0,
        StreetName: searchType === 'street' ? searchTerm : '',
        HouseKey: 0,
        HouseNo: '',
        HouseNoAddition: ''
      },
      zipOrderMode: 0,
      zipFilterMode: 0
    }

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
      const errorText = await response.text()
      console.error('API request failed:', {
        status: response.status,
        error: errorText
      })
      throw new Error(`API request failed`)
    }

    const data = await response.json()

    // Filter results based on canton ZIP codes if enabled
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

    const filteredData = filterResults(data);

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