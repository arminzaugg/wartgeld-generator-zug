import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const config = {
  allowedZipCodes: [
    "6300", "6301", "6302", "6303", "6312", "6313", 
    "6314", "6315", "6317", "6318", "6319", "6330", 
    "6331", "6332", "6333", "6340", "6341", "6343", "6345"
  ]
};

const parseAddressInput = (input: string) => {
  const match = input.match(/^(.*?)(?:\s+(\d+)\s*([A-Za-z])?)?(?:,?\s+(\d{4})\s+(.+))?$/);
  
  if (!match) return { 
    streetName: input.trim(), 
    houseNumber: '', 
    addition: '',
    zipCode: '',
    city: '' 
  };
  
  const [, streetName, number, addition, zipCode, city] = match;
  return {
    streetName: streetName.trim(),
    houseNumber: number || '',
    addition: addition || '',
    zipCode: zipCode || '',
    city: city || ''
  };
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

    const { data: credentials } = await supabaseClient
      .from('api_credentials')
      .select('*')
      .limit(1)
      .single()

    if (!credentials) {
      throw new Error('Failed to fetch API credentials')
    }

    const { type: searchType, searchTerm, zipCode: filterZipCode } = await req.json()
    console.log('Search request:', { searchType, searchTerm, filterZipCode })

    const { streetName, houseNumber, addition } = parseAddressInput(searchTerm)

    const requestBody = {
      request: {
        ONRP: 0,
        ZipCode: searchType === 'zip' ? searchTerm : "63",
        ZipAddition: '',
        TownName: searchType === 'city' ? searchTerm : '',
        STRID: 0,
        StreetName: searchType === 'street' ? streetName : '',
        HouseKey: 0,
        HouseNo: houseNumber,
        HouseNoAddition: addition
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
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    console.log('API response received')

    // Filter results
    const filterResults = (data) => {
      const results = data.QueryAutoComplete4Result?.AutoCompleteResult || [];
      
      const validResults = results
        .filter(item => {
          if (!item.StreetName?.trim() || !item.ZipCode?.trim()) {
            return false;
          }
          return config.allowedZipCodes.includes(item.ZipCode);
        })
        .sort((a, b) => {
          const exactMatchA = a.StreetName.toLowerCase() === streetName.toLowerCase();
          const exactMatchB = b.StreetName.toLowerCase() === streetName.toLowerCase();
          if (exactMatchA && !exactMatchB) return -1;
          if (!exactMatchA && exactMatchB) return 1;
          return 0;
        });

      console.log(`Filtered results: ${validResults.length} of ${results.length} total results`)
      return {
        QueryAutoComplete4Result: {
          AutoCompleteResult: validResults
        }
      };
    };

    const filteredData = filterResults(data);

    return new Response(
      JSON.stringify(filteredData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})