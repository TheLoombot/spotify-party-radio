import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { SpotifyService } from './spotify.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  lastTrack;
  firstTrack;
  displayName;

  constructor(
    private db: AngularFireDatabase,
    private spotifySvc: SpotifyService
  ) {
    this.getLastTracks(1).snapshotChanges()
      .subscribe(
        data => {
          if (data[0]) {
            this.lastTrack = data[0].payload.val();
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
          data => {
            this.displayName = data['display_name'];
          },
          error => {
            console.log('error getting user ID for playlist push', error);
          }
        );
  }

  remove(key: string) {
    this.db.list('Playlist').remove(key);
  }

  getAllTracks() {
    const tracksRef = this.db.list('Playlist');
    const tracks = tracksRef.snapshotChanges().pipe(
      map( changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
    return tracks;
  }

  getFirstTracks(i: number) {
    return this.db.list('Playlist', ref => ref.limitToFirst(i));
  }

  getLastTracks(i: number) {
    return this.db.list('Playlist', ref => ref.limitToLast(i));
  }

  pushTrack(track: Object, displayName = this.displayName) {
    const lastTrackExpiresAt = (this.lastTrack) ? this.lastTrack['expiresAt'] : new Date().getTime();
    const nextTrackExpiresAt = lastTrackExpiresAt + track['duration_ms'] + 1500; // introducing some fudge here

    const playlistEntry = {
      albumName : track['album']['name'],
      albumUrl : track['album']['external_urls']['spotify'],
      artistName : track['artists'][0]['name'],
      addedAt : new Date().getTime(),
      duration : track['duration_ms'],
      expiresAt : nextTrackExpiresAt,
      imageUrl : track['album']['images'][2]['url'],
      trackName : track['name'],
      uri : track['uri'],
      addedBy : displayName
    };
    console.log(new Date().getTime(), 'pushing track onto playlist: ', track['name'], ' expires at ', nextTrackExpiresAt);
    this.db.list('Playlist').push(playlistEntry);
  }

  /** Method to save track in Firebase secondary list */
  saveTrack(track: any): any {
    // console.log('Track to save in Secondary List:', track);
    const trackUri = track.uri.split(':track:')[1]; // Track id based on album url
    /* Verify if it's default robot track */
    if (trackUri === '0RbfwabR0mycfvZOduSIOO') {
      console.log('Default track does not need to be saved in previous played tracks');
    } else {
      /* Clean track Object */
      delete track.expiresAt;
      /* Save track in previous played list */
      this.db.list('Previouslist').set(trackUri, track);
    }
  }

  addSomeTrack() {
    const track = {
      album : {
        'name' : 'placeholder',
        'images' : [
          {'url': 'poop'},
          {'url': 'poop'},
          {'url': 'placholder'}
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
      uri : 'spotify:track:0RbfwabR0mycfvZOduSIOO'
    };

    this.pushTrack(track, 'robot');
  }
}
