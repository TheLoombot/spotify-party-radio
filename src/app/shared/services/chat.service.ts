import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SpotifyService } from './spotify.service';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  environment: string;

  constructor(
    private spotifyService: SpotifyService,
    private db: AngularFireDatabase,
    ) { 

    this.environment = environment.production ? 'prod' : 'dev';

  }

  getMessagesForStation(station: string) {
    return this.db.list(`${this.environment}/${station}/chat/messages`);
  }

  pushMessageToStation(message: string, station: string) {
    const messageObject = {
      message: message,
      username: this.spotifyService.getUserName(),
      user_img: this.spotifyService.getUser()['images'][0]['url'],
    }

    this.db.list(`${this.environment}/${station}/chat/messages`).push(messageObject);
  }

  deleteMessageFromStation(messageId: string, station: string) {
    this.db.list(`${this.environment}/${station}/chat/messages`).remove(messageId);
  }

}
