import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { BattlePlayerService } from '../shared/services/battle-player.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-battle-station',
  templateUrl: './battle-station.component.html',
  styleUrls: ['./battle-station.component.css']
})
export class BattleStationComponent implements OnInit {

  battleSub: Subscription;
  battleId: string;
  user1: string;
  user2: string;
  nowPlaying: string;

  constructor(
    private battlePlayerService: BattlePlayerService,
    private route: ActivatedRoute,
   ) { }

  ngOnInit(): void {

    this.route.params.subscribe( 
      params => { 
        this.battleId = params['battleId'] ;
      }
      );

    this.battleSub = this.battlePlayerService.getBattle(this.battleId).subscribe(
      (object) => {
        this.user1 = object['user1'];
        this.user2 = object['user2'];
        this.nowPlaying = object['nowPlaying'];
      }
      );

  }

  ngOnDestroy() {
    this.battleSub.unsubscribe();
  }

}
