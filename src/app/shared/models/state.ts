import { Error } from './error';

export class State {
  enabled: boolean;
  loading?: boolean;
  token?: string;
  error?: Error;
  station?: string;
}

