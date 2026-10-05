import { NextFunction, Request, Response } from 'express';

// Per-process limit; use a shared gateway limit for multi-instance deployments.
export function createAiRateLimit() {
  const users = new Map<
    string,
    { count: number; resetAt: number; active: boolean }
  >();
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.auth?.payload.sub;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const now = Date.now();
    for (const [id, entry] of users) {
      if (entry.resetAt <= now && !entry.active) users.delete(id);
    }
    const entry = users.get(userId) ?? {
      count: 0,
      resetAt: now + 60000,
      active: false,
    };
    if (
      entry.active ||
      entry.count >= 5 ||
      (!users.has(userId) && users.size >= 10000)
    ) {
      res.setHeader(
        'Retry-After',
        Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
      );
      return res
        .status(429)
        .json({ message: 'Please wait before generating another quiz.' });
    }
    entry.count++;
    entry.active = true;
    users.set(userId, entry);
    res.once('finish', () => {
      entry.active = false;
    });
    next();
  };
}
