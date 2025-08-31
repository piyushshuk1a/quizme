import { config } from '@/config';

export const getManagementApiToken = async () => {
  try {
    const response = await fetch(`https://${config.auth0Domain}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: config.auth0M2MClientId,
        client_secret: config.auth0M2MClientSecret,
        audience: `https://${config.auth0Domain}/api/v2/`,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`,
      );
    }

    const data = (await response.json()) as { access_token: string };
    return data.access_token;
  } catch (error) {
    console.error(
      'Error getting Management API token:',
      (error as Error).message,
    );
    throw error;
  }
};
