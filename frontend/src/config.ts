const apiUrl = import.meta.env.VITE_API_URL;
const userPoolId = import.meta.env.VITE_USER_POOL_ID;
const userPoolClientId = import.meta.env.VITE_USER_POOL_CLIENT_ID;

export const config = {
  apiUrl,
  cognito: {
    userPoolId,
    userPoolClientId,
    region: 'us-east-1',
  }
}; 