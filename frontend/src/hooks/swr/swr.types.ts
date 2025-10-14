import { type Key, type SWRConfiguration } from 'swr';
import { type SWRMutationConfiguration } from 'swr/mutation';

import { API_REQUEST_TYPES } from '@/constants';

export type GenericParams = Record<
  string,
  string | number | undefined | null | boolean
>;
export type GenericPayload = Record<string, unknown> | object;

/**
 * Omitting configuration options already configured globally in the "useFetch" hook
 */
type AllowedSWRConfiguration<TResponse = unknown, TError = unknown> = Omit<
  SWRConfiguration<TResponse, TError>,
  'fetcher'
>;

export type MutateRequestMethods = Exclude<
  ObjectValuesUnion<typeof API_REQUEST_TYPES>,
  typeof API_REQUEST_TYPES.get
>;

export type UseFetchArgs<
  TResponse = unknown,
  TParams extends GenericParams | void = Record<string, string | number>,
  TError = unknown,
> = AllowedSWRConfiguration<TResponse, TError> & {
  /**
   * The path for the API
   */
  path: string | null;

  /**
   * The query-params to be attached to the URL
   */
  params?: TParams;
};

export type UseMutationArgs<
  TPayload extends GenericPayload | void,
  TParams extends GenericParams | void,
  TResponse extends object | unknown = unknown,
  TSWRData = unknown,
  TError = unknown,
  TThrowOnError extends boolean = false,
> = Omit<
  SWRMutationConfiguration<TResponse, TError, Key, TPayload, TSWRData>,
  'fetcher'
> & {
  /**
   * The method for the API request
   * @default 'POST'
   */
  method?: MutateRequestMethods;

  /**
   * The path for the API
   */
  path: string | null;

  /**
   * The query-params to be attached to the URL
   */
  queryParams?: TParams;

  /**
   * Denotes if the error is thrown to the caller code or handled internally
   * @default false
   */
  throwOnError?: TThrowOnError;
};
