import { Injectable } from '@angular/core';
/* Services */
import { SpotifyService } from './spotify.service';
/* RxJs */
import { map } from 'rxjs/operators';
import { take } from 'rxjs/operators';
/* Models */
import { User } from './shared/models/user';
import { Track } from './shared/models/track';
/* Others */
import { AngularFireDatabase } from 'angularfire2/database';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  environment: string;
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
    this.environment = environment.production ? 'prod' : 'dev';
    this.setLists();
    this.playerMetaRef = this.db.object(`${this.stationName}/${this.environment}/player`).query.ref;
  }

  /** Method to set station lists */
  private setLists(): void {
    this.playlistUrl = `${this.stationName}/${this.environment}/lists/playlist`;
    this.previouslistUrl = `${this.stationName}/${this.environment}/lists/previouslist`;
  }

  /** Method to get station data */
  getStation(): string {
    return this.stationName;
  }

  /** Method used to delete a track from the playlist given its id */
  remove(key: string, i: number) {
    console.log("Removing item at index ", i, "with key", key);
    this.db.list(this.playlistUrl).remove(key)
    .then(
      result => {
        // call this when the above completes successfully only!
        this.recalcTimes(i);
      }
      );
  }

  // recalculates expiration times for all tracks in the playlist starting at index i
  recalcTimes(i: number) {
    this.getAllTracks()
      .pipe(take(1)).subscribe(
        data => {
          const tracks = data;
          // console.log("Recalculating expiration times for ", data.length, "tracks, from ", i, "onwards  " );
          if (data.length && (i < data.length)) {
            for (let j = i ; j < data.length ; j++) {
              if (data[j-1]) {
                // console.log("track ", j, " expiration time is", data[j]["expires_at"], " with duration ", data[j]["duration_ms"]);
                // console.log("prior track expires at: ", data[j-1]["expires_at"]);
                var delta = +data[j-1]["expires_at"] + +data[j]["duration_ms"] - +data[j]["expires_at"];
                // the expected delta is 1500ms, which is the fudge factor we add when you
                // add a song to the playlist ... let's assume if the delta is > 2000ms we update
                if (Math.abs(delta) > 2000) { 
                  console.log ("Updating expiration time on ", data[j]["name"]);
                  var new_expires_at = data[j-1]["expires_at"] + data[j]["duration_ms"] + 1500;
                  data[j]["expires_at"] = new_expires_at;
                  // console.log(this.playlistUrl+"/"+data[j]["key"], "poop now expires at ", new_expires_at );
                  this.db.object(this.playlistUrl+"/"+data[j]["key"]).update({expires_at : new_expires_at});
                }
              } else {
                // we reach here if we're evaluating track 0
                // I guess we just always assume it's ok to set the expires_at?
                var new_expires_at = this.getTime() + data[j]["duration_ms"] + 1500;
                data[j]["expires_at"] = new_expires_at;
                console.log ("Updating expiration time on ", data[j]["name"]);
                this.db.object(this.playlistUrl+"/"+data[j]["key"]).update({expires_at : new_expires_at});
              }
            }
          } else {
            // console.log("no tracks to recalc!" )
          }
        },
        error => {
          console.log('Playlist retrieves error: ', error);
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

    console.log(now, 'pushing track onto playlist:', playlistEntry.name , 'expires at', playlistEntry.expires_at);
    this.db.list(this.playlistUrl).push(playlistEntry);
  }

  pushRandomTrack() {
    const getAllPreviousTracksSubscription = this.getAllPreviousTracks()
      .subscribe(
        (tracks: Array<any>) => {
          // console.log(tracks.length, 'previous tracks:', tracks);
          const randomTrack: Track = tracks[Math.floor( Math.random() * tracks.length)] as Track;
          // console.log('Random Track:', randomTrack);
          const now = this.getTime();
          const lastTrackExpiresAt = (this.lastTrack) ? this.lastTrack.expires_at : now;
          const nextTrackExpiresAt = lastTrackExpiresAt + randomTrack.duration_ms + 1500; // introducing some fudge here
          // console.log('last track expires at:', this.showDate(lastTrackExpiresAt));
          // console.log('next track expires at:', this.showDate(nextTrackExpiresAt));

          randomTrack.added_at = now;
          randomTrack.player = {
            auto: true
          };
          randomTrack.expires_at = nextTrackExpiresAt;

          console.log(this.getTime(), 'pushing random track onto playlist:', randomTrack.name , 'expires at', randomTrack.expires_at);
          this.db.list(this.playlistUrl)
            .push(randomTrack)
            .then(
              result => {
                // console.log(result);
                getAllPreviousTracksSubscription.unsubscribe();
              }
            );
        },
        error => console.error(error),
        () => {
          console.log('pushRandomTrack finished', this.getTime());
        }
      );
  }

  /** Method to save track in Firebase secondary list */
  saveTrack(track: Track): any {
    // console.log('Track to save in Secondary List:', track);
    // Verify if it's default robot track
    if (track.id === '0RbfwabR0mycfvZOduSIOO') {
      // console.log('Default track does not need to be saved in previous played tracks');
    } else if (track.player) {
      if (track.player.auto) {
        // console.log('Random track does not need to be saved again in previous played tracks');
      }
    } else {
      // Clean track Object
      delete track.expires_at;
      // Save track in previous played list
      this.db.list(this.previouslistUrl).set(track.id, track);
      console.log(this.getTime(), track.name, ' saved to previous list');
    }
  }

  private getTime(): number {
    return new Date().getTime();
  }

  private showDate(date: number): any {
    return new Date(date).toString();
  }

  /** Method to increase counter */
  autoUpdatePlaylist() {
    this.playerMetaRef
      .transaction(
        (player: any) => {
          const now = this.getTime();
          // console.log(now, 'player', player);
          if (player) {
            // console.log(now, player.last_updated, player.last_auto_added, now - player.last_updated, now - player.last_auto_added);
            if ( (now - player.last_auto_added) < 1000 ) {
              console.warn('autoUpdatePlaylist transaction should not update');
              return undefined;
            } else {
              player.last_auto_added = now;
              // player.last_updated = now;
              // console.log('Update', player);
              return player;
            }
          } else {
            return player;
          }
        }
      )
      .then(
        result => {
          // console.log('autoUpdatePlaylist transaction finished:', result);
          if (result.committed) {
            this.pushRandomTrack();
          } else {
          }
        }
      );
  }
}
