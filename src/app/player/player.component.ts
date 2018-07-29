import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../spotify.service';
import { Observable, interval, pipe } from 'rxjs';
import { switchMap, map, startWith } from 'rxjs/operators';

@Component({
    selector: 'app-player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {

    nowPlaying : Object;
    playerError;

    constructor(private spotify: SpotifyService) {

        // slightly weird that we have to poll here... and not sure what 
        // the best interval is... but there's no other way to get a callback
        // from Spotify when the track changes. The alternative approach
        // is to set a timer based on expiration time and just change tracks
        // then, instead of this way where we observe the playback state
        interval(2000)
        .pipe(switchMap(() => this.spotify.getNowPlaying()))
        .subscribe(
            (data) => {
                this.nowPlaying = data
                console.log("now playing ", this.nowPlaying)

            }, 
            error => {
                this.playerError = error.error.error
                console.log("player error ", this.playerError)
            }

            )
    }

    ngOnInit() {
    }

}
