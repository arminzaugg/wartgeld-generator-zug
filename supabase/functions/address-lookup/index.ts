import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const config = {
  canton: "ZG"
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

    const { type: searchType, searchTerm, zipCode: filterZipCode, limit = 10 } = await req.json()
    console.log('Search request:', { searchType, searchTerm, filterZipCode, limit })

    const { streetName, houseNumber, addition } = parseAddressInput(searchTerm)
    console.log('Parsed address:', { streetName, houseNumber, addition })

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

    // Filter and sort results
    const filterResults = (data) => {
      const results = data.QueryAutoComplete4Result?.AutoCompleteResult || [];

      // Filter by canton and valid addresses only
      const validResults = results
        .filter(item => {
          // Must be in the correct canton
          if (item.Canton !== config.canton) return false;
          
          // Must have a valid street name
          if (!item.StreetName?.trim()) return false;
          
          // Must have a valid ZIP code
          if (!item.ZipCode?.trim()) return false;
          
          return true;
        })
        .sort((a, b) => {
          // Exact matches first
          const exactMatchA = a.StreetName.toLowerCase() === streetName.toLowerCase();
          const exactMatchB = b.StreetName.toLowerCase() === streetName.toLowerCase();
          if (exactMatchA && !exactMatchB) return -1;
          if (!exactMatchA && exactMatchB) return 1;
          
          // Then by string similarity
          return similarity(b.StreetName.toLowerCase(), streetName.toLowerCase()) - 
                 similarity(a.StreetName.toLowerCase(), streetName.toLowerCase());
        })
        .slice(0, limit);

      return {
        QueryAutoComplete4Result: {
          AutoCompleteResult: validResults
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