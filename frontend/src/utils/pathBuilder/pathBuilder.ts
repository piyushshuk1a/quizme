import type { PathBuilderArgs } from './pathBuilder.types';

export const pathBuilder = ({ base, params }: PathBuilderArgs) => {
  const path = `${base}`;
  const QUERY_SEPARATOR = '?';
  const QUERY_JOINER = '&';

  const query = Object.entries(params).reduce((query, [key, value]) => {
    if (value === null || value === undefined) {
      return query;
    }

    return `${query}${key}=${value}${QUERY_JOINER}`;
  }, QUERY_SEPARATOR);

  return `${path}${query.slice(0, -1)}`; // Remove the last '&' or '?' if no params were added
};
