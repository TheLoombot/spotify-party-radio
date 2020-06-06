import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbCarousel, NgbSlideEvent, NgbSlideEventSource } from '@ng-bootstrap/ng-bootstrap';
import { StateService } from '../shared/services/state.service';
import { PlaylistService } from '../shared/services/playlist.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-playerpicker',
  templateUrl: './playerpicker.component.html',
  styleUrls: ['./playerpicker.component.css']
})
export class PlayerpickerComponent implements OnInit {

  currentStation: string;
  stationSub: Subscription;
  stations;

  @ViewChild('carousel', {static : true}) carousel: NgbCarousel;

  constructor(
    private stateService: StateService,
    private playlistService: PlaylistService,
    ) { }

  ngOnInit() {
    this.currentStation = this.playlistService.getStation();
    this.stationSub = this.playlistService.getAllStations()
    .subscribe(
      stations => {
        this.stations = stations;
        console.log(`Total stations: ${this.stations['length']}`);
        // console.log(this.stations);
      },
      error => console.error('Playlist retrieves error: ', error)
      );
    this.carousel.pause();
  }

  onSlide(slideEvent: NgbSlideEvent) {
    console.log(`slide events, yo`);
    this.stateService.sendState({ enabled: true, loading: true, station: slideEvent.current });
    this.playlistService.setStation(slideEvent.current);
    setTimeout(() => {
      this.stateService.sendState({ enabled: true, loading: false, station: slideEvent.current });
    }, 1);
    this.currentStation = slideEvent.current;
  }


  ngOnDestroy() {
    if (this.stationSub) {
      this.stationSub.unsubscribe();
    }
  }


}
