import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { SpotifyService } from './spotify.service';
import { map, take } from 'rxjs/operators';
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
  stationName: string;

  constructor(
    private db: AngularFireDatabase,
    private spotifySvc: SpotifyService
  ) {
    this.setStation();
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

  pushTrack(track: any, userName = this.userName) {
    const lastTrackExpiresAt = (this.lastTrack) ? this.lastTrack.expires_at : this.getTime();
    const nextTrackExpiresAt = lastTrackExpiresAt + track.duration_ms + 1500; // introducing some fudge here
    // console.log('last track expires at:', this.showDate(lastTrackExpiresAt));
    // console.log('next track expires at:', this.showDate(nextTrackExpiresAt));

    // Select Track Img
    let trackImg = 'assets/record.png';
    if (track.image_url) {
      trackImg = track.image_url;
    } else {
      const images = track.album.images.slice(-1); // Select smallest size
      trackImg = images[0].url;
    }

    const additionalData = {
      added_at: this.getTime(),
      added_by: userName,
      album_name: track['album']['name'],
      album_url: track['album']['external_urls']['spotify'],
      artist_name: track['artists'][0]['name'],
      expires_at: nextTrackExpiresAt,
      image_url: trackImg,
    };

    const playlistEntry = {...track, ...additionalData};
    // console.log(playlistEntry);

    console.log(this.getTime(), 'pushing track onto playlist:', playlistEntry.name , 'expires at', playlistEntry.expires_at);
    this.db.list(this.playlistUrl)
      .push(playlistEntry)
      .then(
        (result) => {
          console.log('Push track result:', result);
          this.updateQueueState(false);
        }
      );
  }

  pushRandomTrack() {
    this.getAllPreviousTracks()
      .subscribe(
        (tracks: Array<any>) => {
          // console.log(tracks.length, 'previous tracks:', tracks);
          const randomTrack: Track = tracks[Math.floor( Math.random() * tracks.length)] as Track;
          console.log('Random Track:', randomTrack);
          const now = this.getTime();
          const lastTrackExpiresAt = (this.lastTrack) ? this.lastTrack.expires_at : now;
          const nextTrackExpiresAt = lastTrackExpiresAt + randomTrack.duration_ms + 1500; // introducing some fudge here
          console.log('last track expires at:', this.showDate(lastTrackExpiresAt));
          console.log('next track expires at:', this.showDate(nextTrackExpiresAt));

          randomTrack.added_at = now;
          randomTrack.player = {
            auto: true
          };
          randomTrack.expires_at = nextTrackExpiresAt;

          console.log(this.getTime(), 'pushing track onto playlist:', randomTrack.name , 'expires at', randomTrack.expires_at);
          this.db.list(this.playlistUrl)
            .push(randomTrack)
            .then(
              (result) => {
                console.log('Push track result:', result);
                this.updateQueueState(false);
              }
            );
        },
        error => console.error(error),
        () => {

        }
      );
  }

  /** Method to save track in Firebase secondary list */
  saveTrack(track: Track): any {
    // console.log('Track to save in Secondary List:', track);
    /* Verify if it's default robot track */
    if (track.id === '0RbfwabR0mycfvZOduSIOO') {
      console.log('Default track does not need to be saved in previous played tracks');
    } else if (track.player.auto) {
      console.log('Random track does not need to be saved again in previous played tracks');
    } else {
      /* Clean track Object */
      delete track.expires_at;
      /* Save track in previous played list */
      this.db.list(this.previouslistUrl).set(track.id, track);
      this.isQueueEmpty(false); // Queue is not empty
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
        {
          name: 'placeholder'
        }
      ],
      duration_ms : 6000,
      name : 'placeholder',
      id: '0RbfwabR0mycfvZOduSIOO',
      uri : 'spotify:track:0RbfwabR0mycfvZOduSIOO'
    };

    this.pushTrack(track, 'robot');
  }

  private getTime(): number {
    return new Date().getTime();
  }

  private showDate(date: number): any {
    return new Date(date).toString();
  }

  private setStation(): void {
    this.stationName = 'default';
  }

  private setLists(): void {
    console.log('Environment:', environment);
    if (environment.production) {
      this.playlistUrl = `${this.stationName}/lists/prod/playlist`;
      this.previouslistUrl = `${this.stationName}/lists/prod/previouslist`;
    } else {
      this.playlistUrl = `${this.stationName}/lists/dev/playlist`;
      this.previouslistUrl = `${this.stationName}/lists/dev/previouslist`;
    }
  }

  /** Method to manage empty playlist */
  manageEmptyPlaylist() {
    this.isQueueEmpty(true); // Queue is possibly empty
  }

  getRandomTrack(): any {
    this.getAllPreviousTracks()
      .subscribe(
        (tracks) => {
          // console.log(tracks.length, 'previous tracks:', tracks);
          const randomTrack = tracks[Math.floor( Math.random() * tracks.length)];
          console.log('Random Track:', randomTrack);
          return randomTrack;
        }
      );
  }

  queueState() {
    return this.db.object(`${this.stationName}/empty_queue`).valueChanges().pipe(take(1));
  }

  isQueueEmpty(newState: boolean) {
    this.queueState()
      .subscribe(
        dbState => {
          console.log('queue states:', dbState, newState);
          if (!dbState && newState) {
            this.db.object(`${this.stationName}/empty_queue`).query.ref
              .transaction(
                (state: boolean) => {
                  console.log(`${this.playlistUrl}/empty_queue is:`, state);
                  return newState;
                })
              .then(
                (result) => {
                  console.log('Transaction finished:', result);
                  if (result.committed) {
                    const queueState = result.snapshot.node_.value_;
                    console.log(`${this.playlistUrl}/empty_queue is:`, queueState);
                    if (queueState) {
                      this.pushRandomTrack();
                    }
                  }
                }
              );
          }
        },
        error => {
          console.error(error);
        },
        () => {
          console.log('Automatic addition finished');
        }
      );
  }

  updateQueueState(newState: boolean) {
    this.db.object(`${this.stationName}/empty_queue`).query.ref
      .transaction(
        (state: boolean) => {
          console.log(`${this.playlistUrl}/empty_queue is:`, state);
          return newState;
        })
      .then(
        (result) => {
          console.log('Transaction finished:', result);
          if (result.committed) {
            const queueState = result.snapshot.node_.value_;
            console.log(`${this.playlistUrl}/empty_queue is:`, queueState);
          }
        }
      );
  }
}
