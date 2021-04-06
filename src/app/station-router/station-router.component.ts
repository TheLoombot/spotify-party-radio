import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StateService } from '../shared/services/state.service';
import { SpotifyService } from '../shared/services/spotify.service';
import { PlaylistService } from '../shared/services/playlist.service';
import { User } from '../shared/models/user';

@Component({
  selector: 'app-station-router',
  templateUrl: './station-router.component.html',
  styleUrls: ['./station-router.component.css']
})
export class StationRouterComponent implements OnInit {

  station: string;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stateService: StateService,
    private spotifyService: SpotifyService,
    private playlistService: PlaylistService,
    ) { }

  ngOnInit(): void {
    this.route.params.subscribe( 
      params => { 
        this.station = params['station'] ;
        this.playlistService.setStation(this.station);
      }
      );
  }

}
