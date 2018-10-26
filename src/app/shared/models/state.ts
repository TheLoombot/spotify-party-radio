import { Error } from './error';

export class State {
  enabled: boolean;
  token?: string;
  error?: Error;
}

