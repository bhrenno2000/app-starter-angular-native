export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'https://api.example.com',
  authMock: process.env.EXPO_PUBLIC_AUTH_MOCK !== 'false',
} as const;
