import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { ChatService } from '../shared/services/chat.service';

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
        console.log(this.messages);
      }
      )
    if (this.box) {
      this.box.nativeElement.value = '';
    }
  }

  pushMessage(messageText: string) {
    console.log(messageText);
    if (messageText) {
      this.chatService.pushMessageToStation(messageText, this.currentStation);
    }
  }

}
