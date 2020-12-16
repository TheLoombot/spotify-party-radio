import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { environment } from '../../../environments/environment';
import { Track } from '../models/track';

@Injectable({
  providedIn: 'root'
})
export class BattlePlayerService {
  environment: string;
  battlesRootUrl: string;

  constructor(
    private db: AngularFireDatabase,
    ) 
  {
    this.environment = environment.production ? 'prod' : 'dev';
    this.battlesRootUrl = `${this.environment}/battles`;
  }

  getBattle(battleId: string) {
    return this.db.object(`${this.battlesRootUrl}/${battleId}`).valueChanges();
  }  
  
  pushTrack(battleId: string, track: Track) {
    this.db.object(`${this.battlesRootUrl}/${battleId}/nowplaying`).set(track);
  }
}
