import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { environment } from '../../../environments/environment';

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
  
}
