import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { SpotifyService } from '../spotify.service';
import { PlaylistService } from '../playlist.service';
import { Track } from '../shared/models/track';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  providers: [SpotifyService]
})
export class SearchComponent implements OnInit {
  results: Object;
  searchResults: any;
  tracks: Array<Track>;
  searchTerm$ = new Subject<string>();
  searchError;
  clicked: number;

  constructor(
    private spotify: SpotifyService,
    private playlistSvc: PlaylistService
  ) {
  }

  ngOnInit() {
    this.spotify.search(this.searchTerm$)
    .subscribe(
      (results: any) => {
        this.results = results;
        this.searchResults = results.tracks;
        this.tracks = results.tracks.items as Array<Track>;
        this.clicked = -1;
        console.log('Results:', this.results);
        console.log('Tracks:', this.tracks);
      },
      error => {
        this.searchError = error.error.error;
      }
    );
  }

  pushTrack(track: Object, i: number) {
    this.clicked = i;
    this.playlistSvc.pushTrack(track);
  }
}
