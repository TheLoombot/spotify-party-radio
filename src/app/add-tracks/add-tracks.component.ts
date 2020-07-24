import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Track } from '../shared/models/track';
import { SpotifyService } from '../shared/services/spotify.service';
import { PlaylistService } from '../shared/services/playlist.service';
import { StateService } from '../shared/services/state.service';
import { State } from '../shared/models/state';

@Component({
  selector: 'app-add-tracks',
  templateUrl: './add-tracks.component.html',
  styleUrls: ['./add-tracks.component.css']
})
export class AddTracksComponent implements OnInit {

  @Input() currentStation: string;
  searchResultTotal: number;
  searchTracks;
  searchTerm$ = new Subject<string>();
  offset$ = new Subject<number>();
  curOffset = 0;
  clicked: number;
  pageSize: number = 3;
  recosActive: boolean = true;
  lastFiveSub: Subscription;
  recommendations: Array<Track>;
  seedTracksUris: string;

  constructor(
    private spotifyService: SpotifyService,
    private playlistService: PlaylistService,
    private stateService: StateService,
    ) { }

  ngOnInit(): void {

    this.spotifyService.search(this.searchTerm$, this.offset$)
    .subscribe(
      (results: any) => {
        if (results.tracks) {
          this.searchResultTotal = results.tracks.total;
          this.searchTracks = results.tracks.items as Array<Track>;
        } else {
          this.searchTracks = null;
          this.searchResultTotal = 0;
        }
        this.clicked = -1;
      },
      error => {
        console.error(error);
      }
      );

    // it's important that these emit values once each after the subscription 
    // because if that hasn't happened, combineLatest won't work!
    this.searchTerm$.next('');
    this.offset$.next(this.curOffset);

  }

  ngOnChanges(changes: SimpleChanges) {
    this.tuneToStation(changes['currentStation'].currentValue);
  }

  tuneToStation(stationName: string) {
    this.lastFiveSub?.unsubscribe();
    this.lastFiveSub = this.playlistService.getLastTracks(5).valueChanges()
    .pipe(debounceTime(500))
    .subscribe(
      tracks => {
        this.seedTracksUris = '';
        for (const track in tracks) {
          if (tracks[track]['uri']) {
            this.seedTracksUris += `${tracks[track]['uri'].replace('spotify:track:', '')},`;
          }
        }
        this.refreshRecommendations();
      },
      error => {
        console.log('playlist retrieve error for recos:', error);
      }
      );
  }

  refreshRecommendations(): void {
    if (!this.seedTracksUris) {
      console.warn('There were no seeds in playlist');
      return;
    }
    this.recommendations = null;
    this.spotifyService.getRecos(this.seedTracksUris)
    .subscribe(
      (reccomendations: any) => {
        this.recommendations = reccomendations.tracks as Array<Track>;
        this.clicked = -1;
      },
      error => {
        console.error(error);
        // Add error state here
        this.stateService.sendError(`Error on refresh recos `, error.error.error.status);
      }
      );
  }


  newSearch(eventValue: string, newOffset = this.curOffset) {
    this.searchTerm$.next(eventValue);
    if (newOffset !== this.curOffset) {
      this.curOffset = newOffset;
      this.offset$.next(this.curOffset);
    }
  }

  nextPage() {
    this.curOffset += this.pageSize;
    this.offset$.next(this.curOffset);
  }

  prevPage() {
    this.curOffset -= this.pageSize;
    this.offset$.next(this.curOffset);
  }

  pushTrack(track: Track, i: number) {
    const user = this.spotifyService.getUserName();
    this.clicked = i;
    this.playlistService.pushTrack(track, user);
  }

  clickedRecos() {
    this.recosActive = true;
  }

  clickedPlaylists() {

  }

  ngOnDestroy() {
    if (this.lastFiveSub) {
      this.lastFiveSub.unsubscribe();
    }
  }


}
