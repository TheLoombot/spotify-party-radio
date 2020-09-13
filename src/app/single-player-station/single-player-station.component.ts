import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StateService } from '../shared/services/state.service';
import { SpotifyService } from '../shared/services/spotify.service';
import { PlaylistService } from '../shared/services/playlist.service';
import { State } from '../shared/models/state';

@Component({
  selector: 'app-single-player-station',
  templateUrl: './single-player-station.component.html',
  styleUrls: ['./single-player-station.component.css']
})
export class SinglePlayerStationComponent implements OnInit {

  station: string;
  appEnabled: boolean;

  constructor(
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private stateService: StateService,
    private spotifyService: SpotifyService,
    private playlistService: PlaylistService,
    ) 
  { 
  }

  ngOnInit(): void {

    this.stateService.getState()
      .subscribe(
        (state: State) => {
          this.appEnabled = state.enabled;
        },
        error => console.error(error),
        () => {
          this.cdr.detectChanges();
        }
      );

      this.route.params.subscribe( 
        params => { 
          if (!this.spotifyService.getToken()) {
            this.stateService.sendError(`There is no available token?`);
            return;
          }
          this.station = params['station'] ;
          this.playlistService.setStation(this.station);
          this.appEnabled = true;
        }
        );

  }

  userOwnsStation(): boolean {
    if (this.station == this.spotifyService.getUserName()) return true;
    return false;
  }

}
