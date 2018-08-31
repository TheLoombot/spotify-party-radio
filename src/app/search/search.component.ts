import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../spotify.service';
import { Subject } from 'rxjs';
import { PlaylistService } from '../playlist.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  providers: [SpotifyService]
})
export class SearchComponent implements OnInit {
  results: Object;
  searchTerm$ = new Subject<string>();
  searchError;
  clicked: number;

  constructor(private spotify: SpotifyService, private playlistSvc: PlaylistService) {

    this.spotify.search(this.searchTerm$)
    .subscribe(
      results => {
        this.results = results;
        this.clicked = -1;
        console.log('Results:', this.results);
      },
      error => {
        this.searchError = error.error.error;
      }
    );
  }

  ngOnInit() {
  }

  pushTrack(track: Object, i: number) {
    this.clicked = i;
    this.playlistSvc.pushTrack(track);
  }
}
