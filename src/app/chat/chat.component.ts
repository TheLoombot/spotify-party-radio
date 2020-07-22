import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { ChatService } from '../shared/services/chat.service';
import { SpotifyService } from '../shared/services/spotify.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  @Input() currentStation: string;
  messagesSub;
  messages;
  @ViewChild("box") box: ElementRef;

  constructor(
    private chatService: ChatService,
    private spotifyService: SpotifyService,
    ) { }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges) {
    this.tuneToStation(changes['currentStation'].currentValue);
  }

  tuneToStation(stationName: string) {
    this.messagesSub?.unsubscribe();
    this.chatService.getMessagesForStation(stationName).valueChanges()
    .subscribe(
      messages => {
        this.messages = messages;
      }
      )
    if (this.box) {
      this.box.nativeElement.value = '';
    }
  }

  ownMessage(message: any): boolean {
    if (message['user_name'] === this.spotifyService.getUserName()) return true;
    return false;
  }

  pushMessage(messageText: string) {
    if (messageText) {
      this.chatService.pushMessageToStation(messageText, this.currentStation);
    }
  }

}
