import { type ErrorRequestHandler, type RequestHandler } from 'express';
import { UnauthorizedError } from 'express-oauth2-jwt-bearer';

export const apiNotFound: RequestHandler = (_req, res) => {
  res.status(404).json({ message: 'API endpoint not found.' });
};

/** Keep middleware errors (including Auth0 failures) in the API's JSON format. */
export const apiErrorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  next,
) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof UnauthorizedError) {
    res.set(error.headers);
    res.status(error.status).json({
      message:
        error.status === 403
          ? 'You do not have permission to perform this action.'
          : 'Your session could not be verified. Please sign out and sign in again.',
    });
    return;
  }

  if (error?.type === 'entity.parse.failed') {
    res.status(400).json({ message: 'The request body must be valid JSON.' });
    return;
  }
  if (error?.type === 'entity.too.large') {
    res.status(413).json({ message: 'The request body is too large.' });
    return;
  }

  console.error('Unhandled API error:', error);
  res.status(500).json({
    message: 'An unexpected server error occurred. Please try again.',
  });
};
