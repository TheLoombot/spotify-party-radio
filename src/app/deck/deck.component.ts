import { Component, OnInit, Input, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { DeckService } from '../shared/services/deck.service';
import { Track } from '../shared/models/track';

@Component({
  selector: 'app-deck',
  templateUrl: './deck.component.html',
})
export class DeckComponent implements OnInit {

  @Input() userId: string;
  tracks: any[];
  trackSub;

  constructor(
    private deckService: DeckService,
    ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.trackSub?.unsubscribe();
    this.trackSub = this.deckService.getDeckTracks(this.userId)
    .subscribe(
      tracks => {
        // I don't know why we have to sort again here... 
        // for some reason orderByChild SOMETIMES returns the order wrong! :(
        this.tracks = tracks.sort((a, b) => a['index'] - b['index']);
        // console.log(`Pool update, new size: ${this.tracks.length}`);
        console.log(this.tracks);
      },
      error => console.error('Conshocken police department: ', error)
      );
  }

  // move a pool track up one position
  moveUp(i: number) {
    if (i == 0) return;
    this.tracks.forEach((t, index) => {
      // console.log(`name: ${t.name}, index: ${index}`);
      if (index == (i-1)) {
        this.deckService.updateTrack(this.userId, t.id, {index: index+1});
      } else if (index == i) {
        this.deckService.updateTrack(this.userId, t.id, {index: index-1});
      } else {
        this.deckService.updateTrack(this.userId, t.id, {index: index});
      }
    });
  }

  // move a pool track down one position
  moveDown(i: number) {
    if ((i+1) == this.tracks.length) return;
    this.tracks.forEach((t, index) => {
      // console.log(`name: ${t.name}, index: ${index}`);
      if (index == i) {
        this.deckService.updateTrack(this.userId, t.id, {index: index+1});
      } else if (index == i+1) {
        this.deckService.updateTrack(this.userId, t.id, {index: index-1});
      } else {
        this.deckService.updateTrack(this.userId, t.id, {index: index});
      }
    });
  }

  fixPoolIndexes() {
    this.tracks.forEach((t, index) => {
      // console.log(`name: ${t.name}, index: ${index}`);
      this.deckService.updateTrack(this.userId, t.id, {index: index});
    });
  }

  discard(track: Track) {
    this.deckService.removeFromPool(this.userId, track.id);
  }

  ngOnDestroy() { 
    this.trackSub.unsubscribe();
  }

}
