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
  clicked: number = -1;
  pageSize: number = 3;

  searchResultTotal: number;
  searchTracks: Array<Track>;
  searchTerm$ = new Subject<string>();
  searchOffset$ = new Subject<number>();
  curSearchOffset: number = 0;

  recosActive: boolean = true;
  lastFiveSub: Subscription;
  recommendations: Array<Track>;
  seedTracksUris: string;

  playlistsActive: boolean = false;
  curPlaylistOffset: number = 0;
  curPlaylistTracksOffset: number = 0;
  playlistOffset$ = new Subject<number>();
  playlistTracksOffset$ = new Subject<number>();
  curPlaylistTracks;
  curPlaylist$ = new Subject<string>();
  curPlaylistName: string;
  userPlaylists; 

  likedSongs;
  likedSongsTotal: number;
  curLikedSongsOffset: number = 0;
  likedSongsOffset$ = new Subject<number>();
  likedSongsActive: boolean = false;

  playlistSub: Subscription;
  playlistCount: number = 0;
  poolSub: Subscription;
  poolCount: number;
  deckCount: number;

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
          // for whatever reason this often mismatches actual results 🤨
          this.searchResultTotal = results.tracks.total;
          // console.log(`total results ${this.searchResultTotal}`)
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

    this.spotifyService.getLikedSongs(this.likedSongsOffset$)
    .subscribe(
      (tracks: any) => {
        this.likedSongs = tracks;
        this.likedSongsTotal = tracks.total;
      },
      error => {
        console.log(error);
        this.stateService.sendError(error);
      }
      );

    this.likedSongsOffset$.next(this.curLikedSongsOffset);

  }

  private getTime(): number {
    return new Date().getTime();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.tuneToStation(changes['currentStation'].currentValue);
  }

  tuneToStation(stationName: string) {
    this.recommendations = null;
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

    // big fat debounce times on these next two because deck count isn't critical... 
    // and it takes a while to move stuff between lists for whatever reason 
    this.playlistSub?.unsubscribe();
    this.playlistSub = this.playlistService.getAllTracks().pipe(debounceTime(1000))
    .subscribe(
      tracks => {
        this.playlistCount = tracks.length;
        this.deckCount = this.playlistCount + this.poolCount;
        console.log(this.deckCount);
      });

    this.poolSub?.unsubscribe();
    this.poolSub = this.playlistService.getAllPreviousTracks().pipe(debounceTime(1000))
    .subscribe(
      tracks => {
        this.poolCount = tracks.length;
        this.deckCount = this.playlistCount + this.poolCount;
        console.log(this.deckCount);
      })

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
    // this.playlistService.pushTrack(track, user);
    track.added_at = this.getTime();
    this.playlistService.saveTrack(track);
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

  nextLikedSongsPage() {
    this.curLikedSongsOffset += this.pageSize;
    this.likedSongsOffset$.next(this.curLikedSongsOffset);
    this.clicked = -1;
  }

  prevLikedSongsPage() {
    this.curLikedSongsOffset -= this.pageSize;
    this.likedSongsOffset$.next(this.curLikedSongsOffset);
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
    this.likedSongsActive = false;
    this.clicked = -1;
  }

  clickedPlaylists() {
    this.recosActive = false;
    this.playlistsActive = true;
    this.likedSongsActive = false;    
  }

  clickedLikedSongs() {
    this.recosActive = false;
    this.playlistsActive = false;
    this.likedSongsActive = true;    
  }

  ngOnDestroy() {
    this.lastFiveSub?.unsubscribe();
    this.playlistSub?.unsubscribe();
    this.poolSub?.unsubscribe();
  }

}
