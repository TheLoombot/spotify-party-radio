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
  searchTracks: Array<Track>;
  searchTerm$ = new Subject<string>();
  searchOffset$ = new Subject<number>();
  curSearchOffset: number = 0;
  clicked: number = -1;
  pageSize: number = 3;
  recosActive: boolean = true;
  lastFiveSub: Subscription;
  recommendations: Array<Track>;
  seedTracksUris: string;
  playlistsActive: boolean = false;
  curPlaylistOffset: number = 0;
  curPlaylistTracksOffset: number = 0;
  playlistOffset$ = new Subject<number>();
  playlistTracksOffset$ = new Subject<number>();
  showPlaylists: boolean;
  showTracks: boolean;
  curPlaylistTracks;
  curPlaylist$ = new Subject<string>();
  curPlaylistName: string;
  userPlaylists; 

  constructor(
    private spotifyService: SpotifyService,
    private playlistService: PlaylistService,
    private stateService: StateService,
    ) { }

  ngOnInit(): void {

    this.spotifyService.search(this.searchTerm$, this.searchOffset$)
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
        this.stateService.sendError(error);
      }
      );

    // it's important that these emit values once each after the subscription 
    // because if that hasn't happened, combineLatest won't work!
    this.searchTerm$.next('');
    this.searchOffset$.next(this.curSearchOffset);

    this.spotifyService.getUserPlaylists(this.playlistOffset$)
    .subscribe(
      userPlaylists => {
        this.userPlaylists = userPlaylists;
      },
      error => {
        console.log(error);
        this.stateService.sendError(error);
      }
      );

    this.spotifyService.getTracksForPlaylist(this.curPlaylist$, this.playlistTracksOffset$)
    .subscribe(
      tracks => {
        this.curPlaylistTracks = tracks;
      },
      error => {
        console.log(error);
        this.stateService.sendError(error);
      }
      );

    this.playlistOffset$.next(this.curPlaylistOffset);
    this.playlistTracksOffset$.next(this.curPlaylistTracksOffset);
    this.curPlaylist$.next('');

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


  newSearch(eventValue: string, newOffset = this.curSearchOffset) {
    this.searchTerm$.next(eventValue);
    if (newOffset !== this.curSearchOffset) {
      this.curSearchOffset = newOffset;
      this.searchOffset$.next(this.curSearchOffset);
    }
  }

  nextSearchPage() {
    this.curSearchOffset += this.pageSize;
    this.searchOffset$.next(this.curSearchOffset);
  }

  prevSearchPage() {
    this.curSearchOffset -= this.pageSize;
    this.searchOffset$.next(this.curSearchOffset);
  }

  pushTrack(track: Track, i: number) {
    const user = this.spotifyService.getUserName();
    this.clicked = i;
    this.playlistService.pushTrack(track, user);
  }

  nextPlaylistPage() {
    this.curPlaylistOffset += this.pageSize;
    this.playlistOffset$.next(this.curPlaylistOffset);
  }

  prevPlaylistPage() {
    this.curPlaylistOffset -= this.pageSize;
    this.playlistOffset$.next(this.curPlaylistOffset);
  }

  clickedPlaylist(playlist: Object) {
    this.curPlaylistTracksOffset = 0;
    this.playlistTracksOffset$.next(this.curPlaylistTracksOffset);
    this.curPlaylistName = playlist['name'];
    this.curPlaylist$.next(playlist['id']);
    this.clicked = -1;
  }

  nextPlaylistTracksPage() {
    this.curPlaylistTracksOffset += this.pageSize;
    this.playlistTracksOffset$.next(this.curPlaylistTracksOffset);
    this.clicked = -1;
  }

  prevPlaylistTracksPage() { 
    this.curPlaylistTracksOffset -= this.pageSize;
    this.playlistTracksOffset$.next(this.curPlaylistTracksOffset);
    this.clicked = -1;
  }

  upToPlaylists() {
    this.curPlaylistTracks = null;
    this.curPlaylist$.next('');
    this.clicked = -1;
  }

  clickedRecos() {
    this.recosActive = true;
    this.playlistsActive = false;
  }

  clickedPlaylists() {
    this.recosActive = false;
    this.playlistsActive = true;
  }

  ngOnDestroy() {
    if (this.lastFiveSub) {
      this.lastFiveSub.unsubscribe();
    }
  }

}
