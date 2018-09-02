import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../spotify.service';
import { PlaylistService } from '../playlist.service';
import { interval } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Track } from '../shared/models/track';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {
  nowPlaying;
  playerError;
  playlistRef;
  firstTrack: Track;
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
  }

  ngOnInit() {
    this.playlistRef.snapshotChanges()
      .pipe(debounceTime(300))
      .subscribe(
        data => {
          // console.log('Player data:', data);
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

  private calcProgress(firstTrack: Track): number {
    return Math.floor( 100 * ( 1 - (firstTrack.expires_at - this.getTime() ) / firstTrack.duration_ms) );
  }

  private getTime(): number {
    return new Date().getTime();
  }

  private showDate(date: number): any {
    return new Date(date).toString();
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
    // console.log('checking first track: ', this.firstTrack);
    const timeToExpiration = this.getTime() - this.firstTrack.expires_at;
    // console.log('First track expires at: ', this.showDate(this.firstTrack.expires_at));
    console.log('Time to first track expiration: ', timeToExpiration);

    if (timeToExpiration > 0) {
      // Track has expired
      console.log(this.getTime(), this.firstTrack.name, 'track expired, expected expiration time was', this.firstTrack.expires_at);
      console.log(this.showDate(this.getTime()), 'expected expiration time was', this.showDate(this.firstTrack.expires_at));
      this.playlistSvc.remove(this.firstTrackKey);
      this.playlistSvc.saveTrack(this.firstTrack); // Save track in secondary list
      return;
    }

    this.spotify.getNowPlaying()
      .subscribe(
        (data: any) => {
          this.nowPlaying = data ? data.item : null;
          // console.log('NowPlaying data:', data);
          // console.log('track 1 ', this.firstTrack);
          if (this.nowPlaying == null) {
            // this.playerError = 'poopie';
          } else if (data['is_playing'] && this.nowPlaying.uri === this.firstTrack.uri) {
            console.log(this.getTime(), this.nowPlaying.name, ' Now playing matches position 0, expires in ', timeToExpiration);
            if (!this.pendingCheck) {
              // only schedule the check if there's not one pending already
              // when we support deletes, we'll have to handle cancelling
              // the pending check and replacing it instead. later.
              console.log(this.getTime(), 'Scheduling check in', timeToExpiration);
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
                  console.log(this.getTime(), this.firstTrack.name, ' Requested playback, scheduled check in 1500ms');
                  setTimeout(() => {
                    this.checkFirstTrack();
                  }, 1500);
                  // playTrack doesn't give us an affirmative response on the play request
                  // so we have to wait a bit (fudge = 1.5s) before we try check the 'now
                  // playing status' again
                  this.spotify.seekTrack(this.getTime() - this.firstTrack.expires_at + this.firstTrack.duration_ms)
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
