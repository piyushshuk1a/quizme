/** Read API responses without exposing HTML error pages to the user. */
export async function readApiResponse<T>(response: Response): Promise<T> {
  const body = await response.text();
  let data: unknown;
  try {
    data = body ? JSON.parse(body) : undefined;
  } catch {
    // Proxies and older deployments can return HTML instead of JSON.
  }

  if (!response.ok) {
    if (data && typeof data === 'object') {
      const error = data as Record<string, unknown>;
      const message = error.message || error.error;
      if (typeof message === 'string') throw new Error(message);
    }

    const messages: Record<number, string> = {
      401: 'Your session could not be verified. Please sign out and sign in again.',
      403: 'You do not have permission to perform this action.',
      404: 'This API endpoint is unavailable. Please check that the backend has the latest deployment.',
      429: 'Too many requests. Please wait a moment and try again.',
    };
    throw new Error(
      messages[response.status] ||
        (response.status >= 500
          ? `The server is temporarily unavailable (HTTP ${response.status}). Please try again shortly.`
          : `The server rejected the request (HTTP ${response.status}). Please sign in again and retry.`),
    );
  }

  if (response.status === 204) return undefined as T;
  if (data === undefined) {
    throw new Error(
      'The server returned an unexpected response. Please check the API URL and backend deployment.',
    );
  }
  return data as T;
}
