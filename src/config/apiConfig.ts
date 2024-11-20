interface ApiConfig {
  baseUrl: string;
  username: string;
  password: string;
}

const getApiConfig = (): ApiConfig => {
  return {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    username: import.meta.env.VITE_API_USERNAME || '',
    password: import.meta.env.VITE_API_PASSWORD || ''
  };
};

export const apiConfig = getApiConfig();