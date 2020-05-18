import { Component, OnInit } from '@angular/core';
import { PlaylistService } from '../shared/services/playlist.service';

@Component({
  selector: 'app-resetlibrarybutton',
  templateUrl: './resetlibrarybutton.component.html'
})
export class ResetlibrarybuttonComponent implements OnInit {

  constructor(
      private playlistService: PlaylistService
  	) {
  }

  ngOnInit() {
  }

  pruneTracks() { 
  	this.playlistService.pruneTracks(40);
  }

}
