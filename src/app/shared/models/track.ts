export class Track {
  added_at: number;
  added_by: string;
  album?: any;
  album_name: string;
  album_url: string;
  artists?: Array<any>;
  artist_name: string;
  available_markets?: Array<string>;
  disc_number?: number;
  duration_ms: number;
  expires_at?: number;
  explicit?: boolean;
  external_ids?: {
    isrc: string
  };
  external_urls?: {
    spotify: string
  };
  href?: string;
  id: string;
  image_url: string;
  is_local?: boolean;
  is_playable?: boolean;
  name: string;
  player: {
    auto?: boolean,
    added_at: any,
    added_by: any
  };
  popularity?: number;
  preview_url?: string;
  track_number?: number;
  type?: string;
  uri: string;
}


