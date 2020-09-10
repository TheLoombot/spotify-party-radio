import { Injectable, Component, OnInit, ViewChild } from '@angular/core';
/* RxJs */
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { take, debounceTime } from 'rxjs/operators';
/* Models */
import { Track } from '../models/track';
/* Services */
import { SpotifyService } from './spotify.service';
/* Others */
import { AngularFireDatabase } from '@angular/fire/database';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  environment: string;
  lastTrack: Track;
  playlistUrl: string;
  previouslistUrl: string;
  stationName: string;
  playerMetaRef: any;
  lastTrackSub: Subscription;
  timeOutSubs = [];

  poolTrackSub: Subscription;
  poolTracks;

  constructor(
    private db: AngularFireDatabase,
    private spotifyService: SpotifyService
    ) {

    this.environment = environment.production ? 'prod' : 'dev';

    // on startup, set the current station to the user's own station
    // this.setStation(this.spotifyService.getUserName());

  }

  setStation(stationName: string): void {
    this.timeOutSubs.forEach(id => clearTimeout(id));

    console.log(`Station is: ${stationName}`);
    this.stationName = stationName;
    this.playlistUrl = `${this.environment}/${this.stationName}/lists/playlist`;
    this.previouslistUrl = `${this.environment}/${this.stationName}/lists/previouslist`;
    this.playerMetaRef = this.db.object(`${this.environment}/${this.stationName}/player`).query.ref;

    if (this.lastTrackSub) {
      this.lastTrackSub.unsubscribe();
    }

    this.lastTrackSub = this.getLastTracks(1).snapshotChanges()
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

    if (this.poolTrackSub) {
      this.poolTrackSub.unsubscribe();
    }

    this.poolTrackSub = this.getAllPreviousTracks().subscribe(
      data => {
        // I don't know why we have to sort again here... 
        // for some reason orderByChild SOMETIMES returns the order wrong! :(
        this.poolTracks = data.sort((a, b) => a['index'] - b['index']);
      });

  }

  getStation(): string {
    return this.stationName;
  }

  /** Method used to delete a track from the playlist given its id and index */
  remove(key: string, i: number) {
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
        // console.log('Recalculating expiration times for ', data.length, 'tracks, from ', i, 'onwards  ' );
        if (data.length && (i < data.length)) {
          for (let j = i ; j < data.length ; j++) {
            const timeToExpiration = this.getTime() - data[j]['expires_at'];
            if (timeToExpiration > 0) {
              // Track has expired
              console.log(`${data[j]['name']} expired, not updating expiration time!`);
              return;
            }

            if (data[j - 1]) {
              // console.log('track ', j, ' expiration time is', data[j]['expires_at'], ' with duration ', data[j]['duration_ms']);
              // console.log('prior track expires at: ', data[j-1]['expires_at']);
              const delta = +data[ j - 1]['expires_at'] + +data[j]['duration_ms'] - +data[j]['expires_at'];
              // the expected delta is 1500ms, which is the fudge factor we add when you
              // add a song to the playlist ... let's assume if the delta is > 2000ms we update
              if (Math.abs(delta) > 2000) {
                console.log ('Updating expiration time on ', data[j]['name'], ', delta was', delta);
                var new_expires_at = data[j-1]['expires_at'] + data[j]['duration_ms'] + 1500;
                data[j]['expires_at'] = new_expires_at;
                // console.log(this.playlistUrl+'/'+data[j]['key'], 'poop now expires at ', new_expires_at );
                this.db.object(this.playlistUrl+'/'+data[j]['key']).update({expires_at : new_expires_at});
              }
            } else {
              // we reach here if we're evaluating track 0
              // this duplicates a lot of the above code but ¯\_(ツ)_/¯
              var delta = this.getTime() + data[j]['duration_ms'] - data[j]['expires_at']
              if (Math.abs(delta) > 2000) { 
                console.log ('Updating expiration time on new track 0: ', data[j]['name'], ', delta was', delta);
                var new_expires_at = this.getTime() + data[j]['duration_ms'] + 1500;
                data[j]['expires_at'] = new_expires_at;
                this.db.object(this.playlistUrl+'/'+data[j]['key']).update({expires_at : new_expires_at});
              }
            }
          }
        } else {
          // console.log('no tracks to recalc!' )
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
        // I think sometimes we don't get the correct/expected
        // "key" here... the intended key is the track's key in 
        // the playlist, but we sometimes see that the key is 
        // instead the track's Spotify ID? This leads to bugs
        changes.map(c => ({ key: c.payload.key, ...<Object>c.payload.val() }))
        )
      );
    return tracks;
  }

  getAllStations() {
    const stationsRef = this.db.list(this.environment);
    const stations = stationsRef.snapshotChanges().pipe(
      map( changes =>
        // I think sometimes we don't get the correct/expected
        // "key" here... the intended key is the track's key in 
        // the playlist, but we sometimes see that the key is 
        // instead the track's Spotify ID? This leads to bugs
        changes.map(c => ({ key: c.payload.key, ...<Object>c.payload.val() }))
        )
      );
    return stations;
  }

  getAllPreviousTracks() {
    const tracks = this.db.list(this.previouslistUrl, ref=>ref.orderByChild('index')).valueChanges()
    .pipe(debounceTime(50));
    return tracks;
  }

  getFirstTracks(i: number) {
    return this.db.list(this.playlistUrl, ref => ref.limitToFirst(i));
  }

  getLastTracks(i: number) {
    return this.db.list(this.playlistUrl, ref => ref.limitToLast(i));
  }

  pushTrackForStation(track: any, userName: string, station: string) {
    // console.log(`pushing onto playlist for user ${userName} and station: ${station}`);
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
      // const images = track.album.images.slice(-1); // Select smallest size
      trackImg = track.album.images[1].url;
    }

    const additionalData = {
      added_by: userName,
      album_name: track.album.name,
      album_url: track.album.external_urls.spotify,
      artist_name: track.artists[0].name,
      expires_at: nextTrackExpiresAt,
      image_url: trackImg,
    };

    const playlistEntry = {...track, ...additionalData};

    console.log(`Pushing track onto playlist: ${playlistEntry.name}`);
    if (station == this.stationName) {
      this.db.list(this.playlistUrl).push(playlistEntry);
    } else {
      const playlistUrl = `${this.environment}/${station}/lists/playlist`;
      this.db.list(playlistUrl).push(playlistEntry);
    }

    console.log(`Removing track from pool: ${track.name} with id ${track.id}`);
    this.removeFromPool(track.id);
  }

  // push a track to the *currently tuned* station
  pushTrack(track: any, userName) {
    this.pushTrackForStation(track, userName, this.stationName);
  }

  pruneTracks(tracksToLeave: number) { 
    const getAllPreviousTracksSubscription = this.getAllPreviousTracks()
    .subscribe(
      (tracks: Array<any>) => {
        if (tracks.length <= tracksToLeave) {
          // console.log('not enough tracks to prune: ', tracks.length);
        } else {
          for (let track of tracks.slice(0,tracks.length-tracksToLeave)) {
            // It turns out the track's key in the pool is just its
            // track ID, so we can just remove(track.id)
            console.log('pruning track', track.name);
            this.removeFromPool(track.id);
          }        
        }
        getAllPreviousTracksSubscription.unsubscribe();
      },
      );
  }

  removeFromPool(key: string) {
    this.db.list(this.previouslistUrl).remove(key);
  }

  pushOldestTracks() {
    const getAllPreviousTracksSubscription = this.getAllPreviousTracks()
    .subscribe(
      (tracks: Array<any>) => {
        if (tracks.length > 0) {

          console.log(`🤖 ${tracks.length} tracks in pool, pushing (up to) 1 tracks, seen longest ago!`);
          var delay = 0;
          for (let track of tracks.slice(0,1)) {
            track.player = { auto: true };
            this.timeOutSubs.push(
              setTimeout(() => {
                delete track.index;
                this.pushTrack(track, track['added_by']);
              }, delay)
              )
            // we introduce some delay here to give one track time 
            // to push before the next one does, or else the expiration 
            // times get screwy! 
            delay = delay + 250;
          }

        } else {
          // when there are no previous tracks in the pool (like on first login)
          // then we push three of the user's "top tracks" instead
          this.spotifyService.getTopTracks()
          .subscribe(
            topTracks => {
              topTracks['items'].forEach((track, index) => {
                track.player = { auto: true };
                if (index == 0) {
                  this.pushTrack(track, this.spotifyService.getUserName());
                } else {
                  this.saveTrack(track);
                }
              }); 
            },
            error => {
              console.log(`top track fetch error: ${error}`);
            }
            );
        }
        getAllPreviousTracksSubscription.unsubscribe();
      },
      error => console.error(error),
      () => {
        console.log('pushOldestTracks finished with error ', this.getTime());
      }
      );
  }

  pushRandomTrack() {
    const getAllPreviousTracksSubscription = this.getAllPreviousTracks()
    .subscribe(
      (tracks: Array<any>) => {
        if (tracks.length > 0) {

          console.log(`🤖 ${tracks.length} tracks in pool, pushing (up to) 3 of them`);
          this.shuffleArray(tracks);

          var i = 0;
          var randomTracks = [];

          for (let track of tracks) {
            track.player = { auto: true };
            randomTracks[i] = track;
            if (i >= 2) break;
            i++;
          }

          var delay = 0;

          for (let track of randomTracks) {

            this.timeOutSubs.push(
              setTimeout(() => {
                this.pushTrack(track, track['added_by']);
              }, delay)
              )
            // we introduce some delay here to give one track time 
            // to push before the next one does, or else the expiration 
            // times get screwy! 
            delay = delay + 250;
          }

        } else {
          // when there are no previous tracks in the pool (like on first login)
          // then we push three of the user's "top tracks" instead
          this.spotifyService.getTopTracks()
          .subscribe(
            topTracks => {
              for (let track of topTracks['items']) { 
                this.pushTrack(track, this.spotifyService.getUserName());
              } 
            },
            error => {
              console.log(`top track fetch error: ${error}`);
            }
            );
        }
        getAllPreviousTracksSubscription.unsubscribe();
      },
      error => console.error(error),
      () => {
        console.log('pushRandomTrack finished with error ', this.getTime());
      }
      );
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /** Method to save track in station pool */
  saveTrack(track: Track): any {
    this.saveTrackForStation(track, this.stationName);
  }

  saveTrackForStation(track: Track, station: string) {
    // Clean track Object
    delete track.expires_at;
    // not sure why this is there TBH 🤔
    delete track.key;

    if (!track.added_by) {
      track.added_by = this.spotifyService.getUserName();
    }

    // BUG: when you save tracks from other stations, this references
    // the WRONG station... to be corrected! 
    track.index = (this.poolTracks ? this.poolTracks.length : 0);


    console.log(`Saving ${track.name} to pool ${station}`);

    if (station == this.stationName) {
      this.db.list(this.previouslistUrl).set(track.id, track);
    } else {
      const playlistUrl = `${this.environment}/${station}/lists/previouslist`;
      this.db.list(playlistUrl).set(track.id, track);
    }

    this.fixPoolIndexes();
  }

  // move a pool track up one position
  moveTrackUp(i: number) {
    if (i == 0) return;
    this.poolTracks.forEach((t, index) => {
      // console.log(`name: ${t.name}, index: ${index}`);
      if (index == (i-1)) {
        this.updatePoolTrack(t.id, {index: index+1});
      } else if (index == i) {
        this.updatePoolTrack(t.id, {index: index-1});
      } else {
        this.updatePoolTrack(t.id, {index: index});
      }
    });
  }

  // move a pool track down one position
  moveTrackDown(i: number) {
    if ((i+1) == this.poolTracks.length) return;
    this.poolTracks.forEach((t, index) => {
      // console.log(`name: ${t.name}, index: ${index}`);
      if (index == i) {
        this.updatePoolTrack(t.id, {index: index+1});
      } else if (index == i+1) {
        this.updatePoolTrack(t.id, {index: index-1});
      } else {
        this.updatePoolTrack(t.id, {index: index});
      }
    });
  }

  fixPoolIndexes() {
    this.poolTracks.forEach((t, index) => {
      // console.log(`name: ${t.name}, index: ${index}`);
      this.updatePoolTrack(t.id, {index: index});
    });
  }

  updatePoolTrack(trackKey: string, update: Object) {
    this.db.list(this.previouslistUrl).update(trackKey, update);
  }

  private getTime(): number {
    return new Date().getTime();
  }

  private showDate(date: number): any {
    return new Date(date).toString();
  }

  /** Method to increase counter */
  autoUpdatePlaylist() {
    const now = this.getTime();    
    // this.playerMetaRef.set({last_auto_added: `${now}`};

    this.playerMetaRef
    .transaction(
      (player: any) => {
        if (player) {
          if ( (now - player.last_auto_added) < 1000 ) {
            console.warn('autoUpdatePlaylist transaction should not update');
            return undefined;
          } else {
            player.last_auto_added = now;
            return player;
          }
        } else {
          player = {};
          player.last_auto_added = now;
          console.warn(`No player object on station?`);
          return player;
        }
      }
      )
    .then(
      result => {
        if (result.committed) {
          // this.pushRandomTrack();
          this.pushOldestTracks();
        }
      }
      );
  }

  ngOnDestroy() {
    this.timeOutSubs.forEach(id => clearTimeout(id));
  }

}
