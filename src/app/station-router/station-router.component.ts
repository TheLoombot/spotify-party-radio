import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StateService } from '../shared/services/state.service';

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
    ) { }

  ngOnInit(): void {
    this.route.params.subscribe( 
      params => { 
        this.station = params['station'] ;
        console.log(`routed station is ${this.station}`);
        this.stateService.sendState({ enabled: true, loading: false, station: `${this.station}` });
      }
      );
  }

}
