interface ApiConfig {
  baseUrl: string;
  username: string;
  password: string;
}

const getApiConfig = (): ApiConfig => {
  return {
    baseUrl: import.meta.env.EXTWebServicePROD_API_BASE_URL || 'http://localhost:3000',
    username: import.meta.env.EXTWebServicePROD_API_USERNAME || '',
    password: import.meta.env.EXTWebServicePROD_API_PASSWORD || ''
  };
};

export const apiConfig = getApiConfig();