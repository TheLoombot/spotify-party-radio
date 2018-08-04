import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable({
    providedIn: 'root'
})
export class PlaylistService {

    lastTrack;

    constructor(private db: AngularFireDatabase) { 
        this.getLastTracks(1).snapshotChanges().subscribe
        (data => {
            if (data[0]) {
                this.lastTrack = data[0].payload.val()
            } else {
                this.lastTrack = null;
            }
        },
        error => {
            console.log("playlist retrieve error: ", error)
        })
    }

    getLastTracks(i: number) {
        return this.db.list('Playlist', ref => ref.limitToLast(i))
    }

    pushTrack(track: Object) {

        let lastTrackExpiresAt = (this.lastTrack) ? this.lastTrack["expiresAt"] : new Date().getTime()
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

        this.db.list('Playlist').push(playlistEntry);

    }
}
