import { Component, OnInit } from '@angular/core';
/* RxJs */
import { Subject } from 'rxjs';
/* Models */
import { Track } from '../shared/models/track';
/* Services */
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

  searchResultTotal: number;
  searchTracks;
  searchTerm$ = new Subject<string>();
  offset$ = new Subject<number>();
  curOffset = 0;
  clicked: number;
  pageSize: number = 3;


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
          this.searchTracks = [];
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

}
