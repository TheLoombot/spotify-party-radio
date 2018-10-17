export class State {
  enabled: boolean;
  token?: string;
  error?: {
    code?: number,
    message: string
  };
}

// Invalid access token -- Refresh and Sign In
