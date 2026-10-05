import { useAuth0, type Auth0ContextInterface } from '@auth0/auth0-react';
import useNativeSwrMutation from 'swr/mutation';

import { API_REQUEST_TYPES } from '@/constants';
import { pathBuilder } from '@/utils';

import { readApiResponse } from './apiResponse';
import {
  type GenericParams,
  type GenericPayload,
  type MutateRequestMethods,
  type UseMutationArgs,
} from './swr.types';

/**
 * Executes an API request using the specified HTTP method and payload.
 *
 * @template TResponse - The expected type of the response data.
 * @template TPayload - The type of the payload to be sent with the request.
 *
 * @param path - The API endpoint path to send the request to.
 * @param method - The HTTP method to use for the request (e.g., POST, PUT, PATCH, DELETE).
 * @param payload - The payload to be sent with the request.
 *
 * @returns A promise that resolves to the response data of type `TResponse`.
 *
 * @throws {Error}
 * Throws an error if the request fails.
 */
const executeApiRequest = async <TResponse extends object | void, TPayload>(
  path: string | null,
  method: MutateRequestMethods,
  payload: TPayload,
  getAccessTokenSilently: Auth0ContextInterface['getAccessTokenSilently'],
): Promise<TResponse> => {
  try {
    const token = await getAccessTokenSilently({
      authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
    });

    const basePath = import.meta.env.VITE_API_BASE_URL;
    const response = await fetch(`${basePath}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return await readApiResponse<TResponse>(response);
  } catch (error) {
    console.error(error);

    const apiResponse = error as unknown as Record<string, unknown>;

    const message =
      apiResponse?.error || apiResponse?.message || 'Something went wrong';

    throw message;
  }
};

/**
 * A custom hook that provides a mutation function using SWR (stale-while-revalidate) for API requests.
 * It allows you to perform API mutations with dynamic URL generation and request execution.
 *
 * @template TPayload - The type of the payload sent with the mutation request.
 * @template TParams - The type of the query parameters used to build the URL.
 * @template TResponse - The type of the response returned by the API request.
 * @template TSWRData - The type of the SWR data cache.
 * @template TError - The type of the error object returned in case of a failure.
 *
 * @param args - The arguments for the mutation.
 *  - *path*: The base path or endpoint for the API request.
 *  - *method*: The HTTP method for the API request (default is POST).
 *  - *params*: The query parameters to append to the URL.
 *  - *...options*: Additional options to configure the SWR mutation.
 *
 * @returns The SWR mutation object, including the mutation function and state.
 *
 * @example
 * ```ts
 * const { trigger, isMutating, data, error } = useSwrMutation({
 *   path: `/api/endpoint`,
 *   method: API_REQUEST_TYPES.patch,
 *   pathParams: { taskId: 123 },
 *   onSuccess: (data) => console.log('Success:', data),
 *   onError: (error) => console.error('Error:', error),
 * });
 *
 * trigger();
 * ```
 */
export const useMutation = <
  TPayload extends GenericPayload | void,
  TParams extends GenericParams | void = void,
  TResponse extends object | void = void,
  TSWRData = unknown,
  TError = unknown,
  TThrowOnError extends boolean = false,
>({
  path,
  method = API_REQUEST_TYPES.post,
  queryParams,
  ...options
}: UseMutationArgs<
  TPayload,
  TParams,
  TResponse,
  TSWRData,
  TError,
  TThrowOnError
>) => {
  const { getAccessTokenSilently } = useAuth0();
  let url = path;

  if (queryParams && path) {
    url = pathBuilder({ base: path, params: queryParams });
  }

  const swrMutation = useNativeSwrMutation<
    TResponse,
    TError,
    string | null,
    TPayload,
    TSWRData
  >(
    path,
    (_, { arg }) => executeApiRequest(url, method, arg, getAccessTokenSilently),
    {
      ...options,
      throwOnError: (options.throwOnError ?? false) as TThrowOnError,
    },
  );

  return swrMutation;
};
