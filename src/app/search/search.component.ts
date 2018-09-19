import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
/* Models */
import { Track } from '../shared/models/track';
/* Services */
import { SpotifyService } from '../shared/services/spotify.service';
import { PlaylistService } from '../shared/services/playlist.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
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
        // console.log('Results:', this.results);
        this.searchResults = results.tracks;
        if (results.tracks) {
          this.tracks = results.tracks.items as Array<Track>;
          // console.log('Tracks:', this.tracks);
          this.tracks.forEach( (track: Track) => {
            if (track.album.images.length > 0) {
              const images = track.album.images.slice(-1); // Select smallest size
              track.image_url = images[0].url;
            } else {
              track.image_url = 'assets/record.png'; // Use default image
            }
          });
        } else {
          this.tracks = [];
        }
        this.clicked = -1;
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
