import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { SpotifyService } from '../spotify.service';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-recos',
    templateUrl: './recos.component.html',
    styleUrls: ['./recos.component.css']
})
export class RecosComponent implements OnInit {

    lastFivePlaylistRef;
    lastFiveTrackUris;
    recos;
    recoError;
    clicked;
    lastTrackPlaylistRef;
    lastTrack;

    constructor(private spotify: SpotifyService, db: AngularFireDatabase) { 

        this.lastFivePlaylistRef = db.list('Playlist',ref => ref.limitToLast(5))

        this.lastFivePlaylistRef.valueChanges().pipe(debounceTime(300)).subscribe 
        (data => {
            let tracks = data
            this.lastFiveTrackUris = "";
            for (let track in tracks) {
                this.lastFiveTrackUris += tracks[track]["uri"].replace("spotify:track:","")
                this.lastFiveTrackUris += ","
            }

            this.spotify.getRecos(this.lastFiveTrackUris)
            .subscribe(data => {
                this.recos = data
                this.clicked = -1;
            },
            error => {
                this.recoError = error.error.error
            });
        },
        error => {
            console.log("playlist retrieve error for recos: ", error)
        });

        // THIS IS ALL AN EMBARRASSING HACK I AM A FRAUD BUT HEY IT WORKS EHHHH

        this.lastTrackPlaylistRef = db.list('Playlist', ref => ref.limitToLast(1));

        this.lastTrackPlaylistRef.snapshotChanges().subscribe
        (data => {
            if (data[0]) {
                this.lastTrack = data[0].payload.val()
                // console.log("yes last track: ", this.lastTrack)
            } else {
                this.lastTrack = null;
                // console.log("no last track  ");
            }
        },
        error => {
            console.log("playlist retrieve error: ", error)
        })


    }

    ngOnInit() {
    }

    // This is totally copypaste but I'm too lazy to make a proper service for this task
    pushTrack(track: Object, i: number) {

        this.clicked = i;
        let uri = track["uri"]
        let lastTrackExpiresAt;

        if (this.lastTrack) {
            lastTrackExpiresAt = this.lastTrack["expiresAt"]
        } else { 
            lastTrackExpiresAt = new Date().getTime();
        }

        // use itemsRef.set('key-of-some-data', { value: SomeValue }); 
        // instead of push() so that we can set the URI as our own custom key
        // instead of push()'s automatic key
        // ... we want this so it's easy to check for presence of a given
        // track in the current play list (for search results to know if a track is already in list)
        
        let nextTrackExpiresAt = lastTrackExpiresAt + track["duration_ms"] + 1500 // introducing some fudge here

        let playlistEntry = 
        {
            "albumName" : track["album"]["name"],
            "artistName" : track["artists"][0]["name"],
            "addedAt" : new Date().getTime(),
            "duration" : track["duration_ms"],
            "expiresAt" : nextTrackExpiresAt,  
            "imageUrl" : track["album"]["images"][2]["url"],
            "trackName" : track["name"],
            "uri" : track["uri"]
        }

        console.log(new Date().getTime(), "pushing track onto playlist: ", track["name"], " expires at ", nextTrackExpiresAt);

        this.lastTrackPlaylistRef.push(playlistEntry);

    }


}
