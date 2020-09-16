import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-battle-station',
  templateUrl: './battle-station.component.html',
  styleUrls: ['./battle-station.component.css']
})
export class BattleStationComponent implements OnInit {

  battleId: string;
  user1: string;
  user2: string;

  constructor() { }

  ngOnInit(): void {
  }

}
