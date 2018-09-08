import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { SpotifyService } from './spotify.service';
import { map, take } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operators';
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
  playerMetaRef: any;

  constructor(
    private db: AngularFireDatabase,
    private spotifySvc: SpotifyService
  ) {
    this.setStation();
    this.setLists();

    this.playerMetaRef = this.db.object(`${this.stationName}/player`).query.ref;

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

  /** Method to set station data */
  private setStation(): void {
    this.stationName = 'default'; // There is only 1 station at the moment
  }

  /** Method to get station data */
  getStation(): string {
    return this.stationName;
  }

  /** Method used to delete a track from the playlist given its id */
  remove(key: string) {
    this.db.list(this.playlistUrl)
      .remove(key)
      .then(
        (result) => {
          this.decreasePlaylistCounter();
        }
      );
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

  getPlaylistValueChanges() {
    return this.db.list(this.playlistUrl).valueChanges();
  }

  getPlaylistSnapshotChanges() {
    return this.db.list(this.playlistUrl).snapshotChanges();
  }

  getPlaylistStateChanges() {
    return this.db.list(this.playlistUrl).stateChanges();
  }

  getPlaylistAuditTrail() {
    return this.db.list(this.playlistUrl).auditTrail();
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
    const now = this.getTime();
    const lastTrackExpiresAt = (this.lastTrack) ? this.lastTrack.expires_at : now;
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
      added_at: now,
      added_by: userName,
      album_name: track.album.name,
      album_url: track.album.external_urls.spotify,
      artist_name: track.artists[0].name,
      expires_at: nextTrackExpiresAt,
      image_url: trackImg,
    };

    const playlistEntry = {...track, ...additionalData};
    // console.log(playlistEntry);

    console.log(now, 'pushing track onto playlist:', playlistEntry.name , 'expires at', playlistEntry.expires_at);
    this.db.list(this.playlistUrl)
      .push(playlistEntry)
      .then(
        (result) => {
          console.log('Push track result:', result);
          this.increasePlaylistCounter();
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
                this.increasePlaylistCounter();
              }
            );
        },
        error => console.error(error),
        () => {

        }
      );
  }

  /** Method to increase counter */
  increasePlaylistCounter() {
    this.playerMetaRef
      .transaction(
        (player: any) => {
          console.log('player', player);
          const now = this.getTime();
          if (player) {
            if ( (now - player.last_added) < 33333 ) {
              console.warn('PlaylistCounter+ transaction should not update');
            } else {
              player.queue = player.queue + 1;
              player.last_added = now;
              player.last_updated = now;
              console.log('Update', player);
            }
          }
          return player;
        }
      )
      .then(
        result => console.log('PlaylistCounter+ transaction finished:', result)
      );
  }

  // This is triggered for every client!!!
  /** Method to decrease counter */
  decreasePlaylistCounter() {
    this.playerMetaRef
      .transaction(
        (player: any) => {
          console.log('player', player);
          const now = this.getTime();
          if (player) {
            if ( (now - player.last_removed) < 33333 ) {
              console.warn('PlaylistCounter- transaction should not update');
            } else {
              player.queue = player.queue - 1;
              player.last_added = now;
              player.last_updated = now;
              console.log('Update', player);
            }
          }
          return player;
        }
      )
      .then(
        result => console.log('PlaylistCounter- transaction finished:', result)
      );
  }

  /** Method to save track in Firebase secondary list */
  saveTrack(track: Track): any {
    console.log('Track to save in Secondary List:', track);
    /* Verify if it's default robot track */
    if (track.id === '0RbfwabR0mycfvZOduSIOO') {
      console.log('Default track does not need to be saved in previous played tracks');
    } else if (track.player) {
      if (track.player.auto) {
        console.log('Random track does not need to be saved again in previous played tracks');
      }
    } else {
      /* Clean track Object */
      delete track.expires_at;
      /* Save track in previous played list */
      this.db.list(this.previouslistUrl).set(track.id, track);
    }
  }

  /*
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
  */

  private getTime(): number {
    return new Date().getTime();
  }

  private showDate(date: number): any {
    return new Date(date).toString();
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
    this.db.list(this.playlistUrl).valueChanges()
      .pipe(
        debounceTime(300),
        take(1)
      )
      .subscribe(
        tracks => {
          const queue = tracks.length;
          console.log('tracks in queue:', tracks);
          if (queue === 0) {
            console.log('Queue is empty');
            // Check when was the playlist last changed
            this.db.object(`${this.stationName}/player/last_updated`)
              .valueChanges()
              .subscribe(
                (last_updated: any) => {
                  const now: number = this.getTime();
                  console.log(last_updated, now, now - last_updated);
                  if ((now - last_updated) > 3000) {
                    console.warn('I should add a song');
                  } else {
                    console.log('I should not add a song');
                  }
                }
              );
          } else {
            console.error('Queue is not empty');
          }
        }
      );
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
}
