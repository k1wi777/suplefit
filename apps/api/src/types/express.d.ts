declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        isAdmin: boolean;
      },
      validated?: {
        body?: unknown;
        params?: unknown;
        query?: unknown;
      };
    }
  }
}

export {};

