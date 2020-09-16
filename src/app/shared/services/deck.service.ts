import { Injectable } from '@angular/core';
import { Track } from '../models/track';
import { AngularFireDatabase } from '@angular/fire/database';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeckService {

  environment: string;

  constructor(
  private db: AngularFireDatabase,
  ) { 
    this.environment = environment.production ? 'prod' : 'dev';
  }

  getDeckTracks(userId: string) {
    return this.db.list(`${this.environment}/${userId}/lists/previouslist`).valueChanges();
  }


  removeFromPool(userId: string, key: string) {
    this.db.list(`${this.environment}/${userId}/lists/previouslist`).remove(key);
  }


  updateTrack(userId: string, trackKey: string, update: Object) {
    this.db.list(`${this.environment}/${userId}/lists/previouslist`).update(trackKey, update);
  }


}
