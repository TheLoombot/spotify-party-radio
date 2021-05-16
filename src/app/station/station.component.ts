import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyService } from '../shared/services/spotify.service';

@Component({
  selector: 'app-station',
  templateUrl: './station.component.html',
  styleUrls: ['./station.component.css']
})
export class StationComponent implements OnInit {

  station: string;    

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private spotifyService: SpotifyService,
    ) { }

  ngOnInit(): void {
    this.route.params.subscribe( 
      params => { 
        console.log();
        if (!params['station']) {
          console.log("no route");
          console.log(this.spotifyService.getUser());
          this.router.navigate([this.spotifyService.getUser()]);
        } else {
          this.station = params['station'] ;
        }
      }
      );
  }

}
