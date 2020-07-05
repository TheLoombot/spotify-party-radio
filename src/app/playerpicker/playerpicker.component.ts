import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgbCarousel, NgbSlideEvent, NgbSlideEventSource } from '@ng-bootstrap/ng-bootstrap';
import { SpotifyService } from '../shared/services/spotify.service';
import { PlaylistService } from '../shared/services/playlist.service';
import { StateService } from '../shared/services/state.service';
import { interval, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Track } from '../shared/models/track';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-playerpicker',
  templateUrl: './playerpicker.component.html',
  styleUrls: ['./playerpicker.component.css']
})
export class PlayerpickerComponent implements OnInit {

  @Input() currentStation: string;
  stationSub: Subscription;
  stations;
  playlistSub: Subscription;  
  firstTrackKey;
  firstTrack;
  progress: number;
  showSkip: boolean;
  showNowPlaying: boolean;
  progressSub: Subscription;
  timeOutSubs = [];
  nowPlaying;
  playerError;
  showPushButton: boolean;
  clicked: boolean = false;

  @ViewChild('carousel', {static : true}) carousel: NgbCarousel;

  constructor(
    private titleService: Title,
    private spotifyService: SpotifyService,
    private playlistService: PlaylistService,
    private stateService: StateService,
    private router: Router,
    ) {     
    this.progress = 0;
    this.showSkip = false;
    this.showNowPlaying = false;
  }


  ngOnChanges(changes: SimpleChanges) {
    this.tuneToStation(changes['currentStation'].currentValue);
  }


  ngOnInit() {

    this.stationSub = this.playlistService.getAllStations()
    .subscribe(
      stations => {
        this.stations = stations;
        // console.log(`Total stations: ${this.stations['length']}`);
        // For some reason we have to set the carousel this way SHRUGS:
        setTimeout( () => {
          this.carousel.select(this.currentStation);
        });
        // console.log(this.stations);
      },
      error => console.error('Stations retrieve error: ', error)
      );

    this.progressSub = interval(1000)
    .subscribe(
      () => {
        if (this.firstTrack) {
          this.progress = this.calcProgress(this.firstTrack); // Update Progress
        }
      }
      );
  }

  skipTrack(key: string): void {
    console.log(`Skipping and removing ${this.firstTrack.name} from pool `);
    this.showNowPlaying = false;
    this.playlistService.removeFromPool(this.firstTrack.id);
    this.spotifyService.pauseTrack()
    .subscribe(
      () => {},
      error => {
        console.error('Failed to pause track ', error);
      }
      );
    this.timeOutSubs.forEach(id => clearTimeout(id));
    this.playlistService.remove(key, 0);
    this.showSkip = false;
    this.firstTrack = null;
  }

  pushTrack(track: Track) {
    this.clicked = true;
    this.playlistService.pushTrackForStation(track, this.spotifyService.getUserName(), this.spotifyService.getUserName());    
  }

  onSlide(slideEvent: NgbSlideEvent) {
    this.router.navigate(["", slideEvent.current]);
  }

  tuneToStation(stationName: string) {
    this.showNowPlaying = false;
    this.spotifyService.pauseTrack()
    .subscribe(
      () => {},
      error => {
        console.error('Failed to pause track ', error);
      }
      );
    this.timeOutSubs.forEach(id => clearTimeout(id));
    this.playlistSub?.unsubscribe();
    this.subscribeToPlaylist();
  }

  subscribeToPlaylist() {
    this.playlistSub = this.playlistService.getFirstTracks(1).snapshotChanges()
    .pipe(debounceTime(300))
    .subscribe(
      data => {
        // console.log('Player data:', data);
        if (data[0]) {
          this.firstTrackKey = data[0].key;
          this.firstTrack = data[0].payload.val();
          this.checkFirstTrack();
        } else {
          this.playlistService.autoUpdatePlaylist(); // handle empty playlist
        }
      },
      error => {
        console.log('playlist retrieve error:', error);
      }
      );
  }

  private setTitle(title: string) {
    this.titleService.setTitle(title);
  }

  private calcProgress(firstTrack: Track): number {
    return Math.floor( 100 * ( 1 - (firstTrack.expires_at - this.getTime() ) / firstTrack.duration_ms) );
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
      if (this.firstTrack == null) {
        console.warn(`State of Brad: Sorry mate theres nothing to play`);
        return;
      }

      // console.log(`Checking first track: ${this.firstTrack.name}`);
      const timeToExpiration = this.getTime() - this.firstTrack.expires_at;
      // console.log('First track expires at: ', this.showDate(this.firstTrack.expires_at));
      // console.log('Time to first track expiration: ', timeToExpiration);

      if (timeToExpiration > 0) {
        // Track has expired
        console.log(`${this.firstTrack.name} expired`);
        // console.log(this.showDate(this.getTime()), 'expected expiration time was', this.showDate(this.firstTrack.expires_at));
        this.playlistService.remove(this.firstTrackKey, 0);
        this.playlistService.saveTrack(this.firstTrack); // Save track in secondary list
        this.showSkip = false;
        this.showNowPlaying = false;
        this.firstTrack = null;
        return;
      }

      this.spotifyService.getNowPlaying()
      .subscribe(
        (data: any) => {
          this.nowPlaying = data ? data.item : null;
          if (this.nowPlaying == null) {
            // assmume the player isn't going... wait and try again
            console.warn('There is nothing being played');
            this.timeOutSubs.forEach(id => clearTimeout(id));
            this.timeOutSubs.push(
              setTimeout( () => {
                this.checkFirstTrack();
              }, 2500)
              );
          } else if (this.firstTrack == null) {
            console.warn('Sorry mate theres nothing to play');
          } else if (data.is_playing && this.nowPlaying.uri === this.firstTrack.uri) {
            console.log(`${this.nowPlaying.name} expires in ${timeToExpiration}`);
            this.showNowPlaying = true;
            this.setTitle(`${this.firstTrack.artist_name} - ${this.firstTrack.name}`);
            if (this.userOwnsStation()) {
              this.showSkip = true;
              this.showPushButton = false;
              this.clicked = false;
            } else {
              this.showPushButton = true;
              this.clicked = false;
              this.showSkip = false;
            }
            this.timeOutSubs.forEach(id => clearTimeout(id));
            this.timeOutSubs.push(
              setTimeout( () => {
                this.checkFirstTrack();
              }, -timeToExpiration)
              );

          } else {
            this.spotifyService.playTrack(this.firstTrack.uri)
            .subscribe(
              (response) => {
                // this.playerError = response
                console.log(`${this.firstTrack.name} requested playback, scheduled check in 1000ms`);
                setTimeout(() => {
                  this.checkFirstTrack();
                }, 1000);
                // playTrack doesn't give us an affirmative response on the play request
                // so we have to wait a bit (fudge = 1.0s) before we try check the 'now
                // playing status' again
                this.spotifyService.seekTrack(this.getTime() - this.firstTrack.expires_at + this.firstTrack.duration_ms)
                .subscribe(
                  () => {},
                  error => {
                    console.error('Brads error: failed on seek', error);
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
          console.error('Now playing error:', error);
          this.stateService.sendError(`There is no available user, ${error.error.error.message}`, error.error.error.status);
          this.setTitle('Logged out');
        }
        );
    }

    userOwnsStation(): boolean {
      if (this.currentStation == this.spotifyService.getUserName()) return true;
      return false;
    }

    ngOnDestroy() {
      // console.log('DESTROYERRR');
      this.spotifyService.pauseTrack()
      .subscribe(
        () => {},
        error => {
          console.error('Failed to pause track ', error);
        }
        );
      if (this.stationSub) {
        this.stationSub.unsubscribe();
      }
      if (this.playlistSub) {
        this.playlistSub.unsubscribe();
      }
      if (this.progressSub) {
        this.progressSub.unsubscribe();
      }
      this.timeOutSubs.forEach(id => clearTimeout(id));
    }


  }
