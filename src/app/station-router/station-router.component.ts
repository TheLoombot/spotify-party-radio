import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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
    ) { }

  ngOnInit(): void {
    this.route.params.subscribe( 
      params => { 
        this.station = params['station'] ;
        console.log(`routed station is ${this.station}`);
      }
      );
  }

}
