import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../spotify.service';
import { Observable, interval, pipe } from 'rxjs';
import { switchMap, map, startWith, distinctUntilChanged } from 'rxjs/operators';
import { AngularFireDatabase } from 'angularfire2/database';

@Component({
    selector: 'app-player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {

    nowPlaying : Object;
    playerError;
    firstTrack;

    constructor(private spotify: SpotifyService, db: AngularFireDatabase) {


        db.list('Playlist',ref => ref.limitToFirst(1)).valueChanges().subscribe 
        (data => {
            this.firstTrack = data[0]
            console.log("First track is: ", this.firstTrack)
            this.checkFirstTrack()
        },
        error => {
            console.log("playlist retrieve error: ", error)
        }
        )

        // slightly weird that we have to poll here... and not sure what 
        // the best interval is... but there's no other way to get a callback
        // from Spotify when the track changes. The alternative approach
        // is to set a timer based on expiration time and just change tracks
        // then, instead of this way where we observe the playback state
        interval(2000)
        .pipe(switchMap(() => this.spotify.getNowPlaying()))
        .pipe(distinctUntilChanged())          // this doesn't work ☹️
        .subscribe(
            (data) => {
                this.nowPlaying = data
                console.log("now playing ", this.nowPlaying)
                this.checkFirstTrack()
            }, 
            error => {
                this.playerError = error.error.error
                console.log("player error ", this.playerError)
            }
            )
    }

    ngOnInit() {
    }

    /** 
    Called either when the "Now Playing" state changes, or when 
    when the first entry of the playlist changes. 

    Job is to: 
      * Check if first track is expired, if so delete it, ya done 
      * If not, check if it's already playing, if so ya done
      * If it's not playing, play it, ya done                     
    **/
    checkFirstTrack() { 
        if (!this.firstTrack) return ;

        let timeToExpiration =  new Date().getTime() - this.firstTrack.expiresAt
        console.log("time to expiration", timeToExpiration)
    }

  }
