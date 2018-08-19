import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../spotify.service';
import { PlaylistService } from '../playlist.service';
import { interval } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {
  nowPlaying;
  playerError;
  playlistRef;
  firstTrack;
  firstTrackKey;
  pendingCheck: boolean;
  progress: number;

  constructor(
    private spotify: SpotifyService,
    private playlistSvc: PlaylistService
  ) {
    this.pendingCheck = false;
    this.progress = 0;

    this.playlistRef = playlistSvc.getFirstTracks(1);

    this.playlistRef.snapshotChanges()
      .pipe(debounceTime(300))
      .subscribe(
        data => {
          // console.log('player data:', data);
          if (data[0]) {
            this.firstTrackKey = data[0].key;
            this.firstTrack = data[0].payload.val();
            // console.log(`First track ${this.firstTrackKey} is:`, this.firstTrack);
            this.checkFirstTrack();
          } else {
            this.playlistSvc.addSomeTrack();
          }
        },
        error => {
          console.log('playlist retrieve error:', error);
        }
      );

    interval(1000)
      .subscribe(
        () => {
          if (this.firstTrack) {
            this.progress = this.calcProgress(this.firstTrack);
          }
        }
      );
  }

  ngOnInit() {
  }

  private calcProgress (firstTrack: any): number {
    return Math.floor( 100 * ( 1 - (firstTrack.expiresAt - new Date().getTime() ) / firstTrack.duration) );
  }

  private getTime(): number {
    return new Date().getTime();
  }

  /**
    Called either when the 'Now Playing' state changes, or when
    when the first entry of the playlist changes.

    Job is to:
    * Check if first track is expired, if so delete it, ya done
    * If not, check if it's already playing, if so ya done
    * If it's not playing, play it, ya done
  **/
  checkFirstTrack() {
    console.log('checking first track: ', this.firstTrack);
    const timeToExpiration = this.getTime() - this.firstTrack.expiresAt;
    console.log('time to first track expiration: ', timeToExpiration);

    if (timeToExpiration > 0) {
      // Track has expired
      console.log(this.getTime(), this.firstTrack.trackName, ' track expired, expected expiration time was ', this.firstTrack.expiresAt);
      this.playlistSvc.remove(this.firstTrackKey);
      this.playlistSvc.saveTrack(this.firstTrack); // Save track in secondary list
      return;
    }

    this.spotify.getNowPlaying()
      .subscribe(
        (data) => {
          this.nowPlaying = data;
          // console.log('now playing ', this.nowPlaying);
          // console.log('track 1 ', this.firstTrack);
          if (this.nowPlaying == null) {
            // this.playerError = 'poopie';
          } else if (this.nowPlaying['is_playing'] && this.nowPlaying.item.uri == this.firstTrack.uri) {
            console.log(this.getTime(), this.nowPlaying.item.name, ' Now playing matches position 0, expires in ', timeToExpiration);
            if (!this.pendingCheck) {
              // only schedule the check if there's not one pending already
              // when we support deletes, we'll have to handle cancelling
              // the pending check and replacing it instead. later.
              console.log(this.getTime(), ' Scheduling check in ', timeToExpiration);
              this.pendingCheck = true;
              setTimeout( () => {
                this.checkFirstTrack();
                this.pendingCheck = false;
              }, -timeToExpiration);
            } else {
              console.log(this.getTime(), ' NOT scheduling check, one is pending, yo ', timeToExpiration);
            }
          } else {
            this.spotify.playTrack(this.firstTrack.uri)
              .subscribe(
                (response) => {
                  // this.playerError = response
                  console.log(this.getTime(), this.firstTrack.trackName, ' Requested playback, scheduled check in 1500ms ')
                  setTimeout(() => {
                    this.checkFirstTrack();
                  }, 1500);
                  // playTrack doesn't give us an affirmative response on the play request
                  // so we have to wait a bit (fudge = 1.5s) before we try check the 'now
                  // playing status' again
                  this.spotify.seekTrack(this.getTime() - this.firstTrack.expiresAt + this.firstTrack.duration)
                    .subscribe(
                      () => {
                        // no op
                      },
                      error => {
                        console.log('Brads error: failed on seek', error);
                      }
                    );
                  },
                error => {
                  this.playerError = error.error.error;
                  console.log('play back error ', this.playerError);
                }
              );
          }
        },
        error => {
          this.playerError = error.error.error;
          console.log('now playing error  ', this.playerError);
        }
      );
  }
}
