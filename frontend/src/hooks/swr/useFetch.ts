import { useAuth0, type Auth0ContextInterface } from '@auth0/auth0-react';
import useSWR from 'swr';

import { API_REQUEST_TYPES } from '@/constants';
import { pathBuilder } from '@/utils';

import { readApiResponse } from './apiResponse';
import { type GenericParams, type UseFetchArgs } from './swr.types';

/**
 * Handles making a GET request to the given endpoint
 * @param path The path along with query-params
 * @returns The response from the API
 * @throws a javascript error if any error occurs during the API call
 */
const fetcher = async <TResponse = unknown>(
  path: string,
  getAccessTokenSilently: Auth0ContextInterface['getAccessTokenSilently'],
  isAuthenticated: boolean,
) => {
  try {
    const token = isAuthenticated
      ? await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        })
      : null;

    const basePath = import.meta.env.VITE_API_BASE_URL;
    const response = await fetch(`${basePath}${path}`, {
      method: API_REQUEST_TYPES.get,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    return await readApiResponse<TResponse>(response);
  } catch (err) {
    console.error(err);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiError = err as any;
    const message =
      apiError?.message || apiError?.error || 'Something went wrong';
    throw message;
  }
};

/**
 * Custom hook for fetching the data from the APIs
 * @param args The args for fetching the data
 * @returns An object with data fetched from the API
 */
export const useFetch = <
  TResponse = unknown,
  TPayload extends GenericParams | void = Record<
    string,
    string | number | undefined
  >,
  TError = unknown,
>({
  path,
  params,
  ...rest
}: UseFetchArgs<TResponse, TPayload, TError>) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  let url = path;
  if (params && path) {
    url = pathBuilder({ base: path, params });
  }

  const swrResponse = useSWR<TResponse, TError, string | null>(
    url,
    (pathArgs) =>
      fetcher<TResponse>(pathArgs, getAccessTokenSilently, isAuthenticated),
    rest,
  );

  return swrResponse;
};
