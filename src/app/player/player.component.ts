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

    nowPlaying;
    playerError;
    playlistRef;
    firstTrack;
    firstTrackKey;

    constructor(private spotify: SpotifyService, db: AngularFireDatabase) {

        this.playlistRef = db.list('Playlist',ref => ref.limitToFirst(1));

        this.playlistRef.snapshotChanges().subscribe 
        (data => {
            if (data[0]) {
                this.firstTrackKey = data[0].key
                // console.log("first track key: ", this.firstTrackKey)
                
                this.firstTrack = data[0].payload.val()
                // console.log("First track is: ", this.firstTrack)
                this.checkFirstTrack()
            } else {
                // console.log("playlist is empty ");
            }
        },
        error => {
            console.log("playlist retrieve error: ", error)
        })
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

          // console.log("checking first track: ", this.firstTrack);
          if (!this.firstTrack) return ;

          let timeToExpiration = new Date().getTime() - this.firstTrack.expiresAt
          // console.log("time to first track expiration: ", timeToExpiration)

          if (timeToExpiration > 0) {
              console.log("track expired ! ", this.firstTrack)
              this.playlistRef.remove(this.firstTrackKey)
              return
          }

          this.spotify.getNowPlaying()
          .subscribe(
              (data) => {
                  this.nowPlaying = data
                  // console.log("now playing ", this.nowPlaying)
                  // console.log("track 1 ", this.firstTrack)
                  if (this.nowPlaying["is_playing"] && this.nowPlaying.item.uri == this.firstTrack.uri) {
                      console.log("now playing is track 1, expires in ", timeToExpiration)
                      setTimeout(()=>{
                          this.checkFirstTrack()
                      }, -timeToExpiration)
                  } else {
                      this.spotify.playTrack(this.firstTrack.uri)
                      .subscribe(response => {
                          this.playerError = response
                          setTimeout(()=>{
                              this.checkFirstTrack()
                          }, 1000)
                      this.spotify.seekTrack(new Date().getTime() - this.firstTrack.expiresAt + this.firstTrack.duration)
                      .subscribe(response => {
                          this.playerError = response
                      })
                  }, 
                  error => {
                      this.playerError = error.error.error
                      console.log("play back error ", this.playerError)
                  })
      }

  }, 
  error => {
      this.playerError = error.error.error
      console.log("now playing error  ", this.playerError)
  }
  )

}

}
