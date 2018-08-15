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
  userId;

  constructor(private db: AngularFireDatabase, private spotifySvc: SpotifyService) {
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
          console.log('Playlist retrieves error: ', error);
        }
      );

    this.spotifySvc.user()
      .subscribe(
        data => {
          this.userId = data['id'];
        },
        error => {
          console.log('error getting user ID for playlist push', error);
        }
      );
  }

  remove(key: string) {
    this.db.list('Playlist').remove(key); // Remove from main list
    this.db.list('Previouslist').remove(key); // Remove from secondary list
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

  pushTrack(track: any, userId = this.userId) {
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
      addedBy : userId
    };

    const trackPushId = this.db.createPushId();
    console.log(`${new Date().getTime()} pushing track ${trackPushId} onto playlist: ${track.name} expires at ${nextTrackExpiresAt}`);
    this.db.list('Playlist').set(trackPushId, playlistEntry);
    delete playlistEntry.expiresAt; // Not needed in PreviousList
    this.db.list('Previouslist').set(trackPushId, playlistEntry);
  }

  addSomeTrack() {
    const track = {
      'album' : {
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
      'artists' : [{name: 'placeholder'}],
      'duration_ms' : 6000,
      'name' : 'placeholder',
      'uri' : 'spotify:track:0RbfwabR0mycfvZOduSIOO'
    };
    this.pushTrack(track, 'robot');
  }
}
