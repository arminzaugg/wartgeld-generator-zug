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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch API credentials from the database
    const { data: credentials, error: credentialsError } = await supabaseClient
      .from('api_credentials')
      .select('*')
      .limit(1)
      .single();

    if (credentialsError || !credentials) {
      console.error('Failed to fetch API credentials:', credentialsError);
      throw new Error('Failed to fetch API credentials');
    }

    const { type, searchTerm, zipCode: filterZipCode } = await req.json();
    console.log('Search request:', { type, searchTerm, filterZipCode });

    const requestBody = {
      request: {
        ONRP: 0,
        ZipCode: type === 'zip' ? searchTerm : filterZipCode || "63",
        ZipAddition: '',
        TownName: type === 'city' ? searchTerm : '',
        STRID: 0,
        StreetName: type === 'street' ? searchTerm : '',
        HouseKey: 0,
        HouseNo: '',
        HouseNoAddition: ''
      },
      zipOrderMode: 0,
      zipFilterMode: 0
    };

    console.log('API request:', requestBody);

    const response = await fetch('https://webservices.post.ch:17023/IN_SYNSYN_EXT/REST/v1/autocomplete4', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error('API request failed:', response.status, await response.text());
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response received');

    // Filter results to only include allowed zip codes
    const filteredData = {
      QueryAutoComplete4Result: {
        AutoCompleteResult: (data.QueryAutoComplete4Result?.AutoCompleteResult || [])
          .filter(item => config.allowedZipCodes.includes(item.ZipCode))
      }
    };

    return new Response(
      JSON.stringify(filteredData),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Error in edge function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});