import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpotifyService } from '../shared/services/spotify.service';
import { PlaylistService } from '../shared/services/playlist.service';

@Component({
  selector: 'app-single-player-station',
  templateUrl: './single-player-station.component.html',
  styleUrls: ['./single-player-station.component.css']
})
export class SinglePlayerStationComponent implements OnInit {

  station: string;

  constructor(
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private spotifyService: SpotifyService,
    private playlistService: PlaylistService,
    ) 
  { 
  }

  ngOnInit(): void {
      this.route.params.subscribe( 
        params => { 
          this.station = params['station'] ;
          this.playlistService.setStation(this.station);
        }
        );
  }

  userOwnsStation(): boolean {
    if (this.station == this.spotifyService.getUserName()) return true;
    return false;
  }

}
