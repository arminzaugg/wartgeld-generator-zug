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

const parseAddressInput = (input: string) => {
  // Match pattern: street + number + optional letter, optional zip + city
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

    const { data: credentials, error: credentialsError } = await supabaseClient
      .from('api_credentials')
      .select('*')
      .limit(1)
      .single()

    if (credentialsError) {
      console.error('Failed to fetch API credentials:', credentialsError)
      throw new Error('Failed to fetch API credentials')
    }

    const { type: searchType, searchTerm, zipCode: filterZipCode } = await req.json()
    console.log('Search request:', { searchType, searchTerm, filterZipCode })

    const { streetName, houseNumber, addition } = parseAddressInput(searchTerm)
    console.log('Parsed address:', { streetName, houseNumber, addition })

    // Create request body based on search type and parsed input
    const requestBody = {
      request: {
        ONRP: 0,
        ZipCode: searchType === 'zip' ? searchTerm : filterZipCode || '',
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

    console.log('API request body:', requestBody)

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
    console.log('API response:', data)

    // Filter results based on canton ZIP codes if enabled
    const filterResults = (data) => {
      if (!config.zipFilter.cantons.ZG.enabled) return data;

      const allowedZipCodes = config.zipFilter.cantons.ZG.zipCodes;
      const results = data.QueryAutoComplete4Result?.AutoCompleteResult || [];

      // Sort results by relevance
      const sortedResults = results
        .filter(item => allowedZipCodes.includes(item.ZipCode))
        .sort((a, b) => {
          // Exact street name match gets highest priority
          if (a.StreetName.toLowerCase() === streetName.toLowerCase()) return -1;
          if (b.StreetName.toLowerCase() === streetName.toLowerCase()) return 1;

          // Then sort by string similarity
          const aSimilarity = similarity(a.StreetName.toLowerCase(), streetName.toLowerCase());
          const bSimilarity = similarity(b.StreetName.toLowerCase(), streetName.toLowerCase());
          return bSimilarity - aSimilarity;
        });

      return {
        QueryAutoComplete4Result: {
          AutoCompleteResult: sortedResults
        }
      };
    };

    const filteredData = filterResults(data);
    console.log('Filtered and sorted results:', filteredData)

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

// Levenshtein distance for string similarity
function similarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1.0;
  
  const costs = new Array();
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }
  return (longer.length - costs[shorter.length]) / longer.length;
}