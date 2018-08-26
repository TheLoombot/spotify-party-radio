import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { SpotifyService } from './spotify.service';
import { map } from 'rxjs/operators';
import { User } from './shared/models/user';
import { Track } from './shared/models/track';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  lastTrack: Track;
  firstTrack;
  userName: string;
  playlistUrl: string;
  previouslistUrl: string;

  constructor(
    private db: AngularFireDatabase,
    private spotifySvc: SpotifyService
  ) {
    this.setLists();

    this.getLastTracks(1).snapshotChanges()
      .subscribe(
        data => {
          if (data[0]) {
            this.lastTrack = data[0].payload.val() as Track;
          } else {
            this.lastTrack = null;
          }
        },
        error => {
          console.log('playlist retrieve error:', error);
        }
      );

    this.spotifySvc.user()
      .subscribe(
        (user: User) => {
          // console.log(user);
          if (user.display_name) {
            this.userName = user.display_name;
          } else {
            this.userName = user.id;
          }
        },
        error => {
          console.log('error getting user ID for playlist push', error);
        }
      );
  }

  remove(key: string) {
    this.db.list(this.playlistUrl).remove(key);
  }

  getAllTracks() {
    const tracksRef = this.db.list(this.playlistUrl);
    const tracks = tracksRef.snapshotChanges().pipe(
      map( changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
    return tracks;
  }

  getAllPreviousTracks() {
    const tracksRef = this.db.list(this.previouslistUrl);
    const tracks = tracksRef.snapshotChanges().pipe(
      map( changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
    return tracks;
  }

  getFirstTracks(i: number) {
    return this.db.list(this.playlistUrl, ref => ref.limitToFirst(i));
  }

  getLastTracks(i: number) {
    return this.db.list(this.playlistUrl, ref => ref.limitToLast(i));
  }

  pushTrack(track: any, userName = this.userName): void {
    const now = this.getTime();
    const lastTrackExpiresAt = (this.lastTrack) ? this.lastTrack.expires_at : now;
    const nextTrackExpiresAt = lastTrackExpiresAt + track.duration_ms + 1500; // introducing some fudge here
    console.log('last track expires at:', this.showDate(lastTrackExpiresAt));
    console.log('next track expires at:', this.showDate(nextTrackExpiresAt));

    const additionalData = {
      added_at: now,
      added_by: userName,
      album_name: track['album']['name'],
      album_url: track['album']['external_urls']['spotify'],
      artist_name: track['artists'][0]['name'],
      expires_at: nextTrackExpiresAt,
      image_url: track['album']['images'][2]['url'],
      player: {
        auto: false
      }
    };

    const playlistEntry = {...track, ...additionalData};

    console.log(this.getTime(), 'pushing track onto playlist:', playlistEntry.name , 'expires at', playlistEntry.expires_at);
    this.db.list(this.playlistUrl).push(playlistEntry);
  }

  pushRandomTrack(track: any) {
    const now = this.getTime();
    const lastTrackExpiresAt = (this.lastTrack) ? this.lastTrack.expires_at : now;
    const nextTrackExpiresAt = lastTrackExpiresAt + track.duration_ms + 1500; // introducing some fudge here
    console.log('last track expires at:', this.showDate(lastTrackExpiresAt));
    console.log('next track expires at:', this.showDate(nextTrackExpiresAt));

    track.added_at = now;
    track.player.auto = true;
    track.expires_at = nextTrackExpiresAt;

    console.log(this.getTime(), 'pushing track onto playlist:', track.name , 'expires at', track.expires_at);
    this.db.list(this.playlistUrl).push(track);
  }

  /** Method to save track in Firebase secondary list */
  saveTrack(track: Track): any {
    console.log('Track to save in Secondary List:', track);
    if (track.id === '0RbfwabR0mycfvZOduSIOO') {
      // Verify if it's default robot track
      console.log('Default track does not need to be saved in previous played tracks');
    } else if (track.player.auto) {
      console.log('Random track does not need to be saved again in previous played tracks');
    } else {
      /* Clean track Object */
      delete track.expires_at;
      /* Save track in previous played list */
      this.db.list(this.previouslistUrl).set(track.id, track);
    }
  }

  addDefaultTrack() {
    const track = {
      album : {
        'name' : 'placeholder',
        'images' : [
          {'url': 'poop'},
          {'url': 'poop'},
          {'url': 'placeholder'}
        ],
        'external_urls' : {
          'spotify' : 'https://open.spotify.com/album/6hoAjrSXyYJlJ0p9g3QjT1'
        }
      },
      artists : [
        {name: 'placeholder'}
      ],
      duration_ms : 6000,
      name : 'placeholder',
      id: '0RbfwabR0mycfvZOduSIOO',
      uri : 'spotify:track:0RbfwabR0mycfvZOduSIOO'
    };

    this.pushTrack(track, 'Robot');
  }

  private getTime(): number {
    return new Date().getTime();
  }

  private showDate(date: number): any {
    return new Date(date).toString();
  }

  private setLists() {
    console.log('Environment:', environment);
    if (environment.production) {
      this.playlistUrl = `prod/playlist`;
      this.previouslistUrl = `prod/previouslist`;
    } else {
      this.playlistUrl = `dev/playlist`;
      this.previouslistUrl = `dev/previouslist`;
    }
  }
}
