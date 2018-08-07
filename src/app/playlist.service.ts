import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { SpotifyService } from './spotify.service';

@Injectable({
    providedIn: 'root'
})
export class PlaylistService {

    lastTrack;
    firstTrack
    userId;

    constructor(private db: AngularFireDatabase, private spotifySvc: SpotifyService) { 
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

        this.spotifySvc.user().subscribe(
            data => { 
                this.userId = data["id"]
            },
            error => {
                console.log("error getting user ID for playlist push", error)
            }
            )

    }

    remove(key: string) {
        this.db.list('Playlist').remove(key)
    }

    getAllTracks() {
        return this.db.list('Playlist')
    }

    getFirstTracks(i: number) {
        return this.db.list('Playlist', ref => ref.limitToFirst(i))
    }

    getLastTracks(i: number) {
        return this.db.list('Playlist', ref => ref.limitToLast(i))
    }

    pushTrack(track: Object, userId = this.userId) {

        let lastTrackExpiresAt = (this.lastTrack) ? this.lastTrack["expiresAt"] : new Date().getTime()
        let nextTrackExpiresAt = lastTrackExpiresAt + track["duration_ms"] + 1500 // introducing some fudge here

        let playlistEntry = 
        {
            "albumName" : track["album"]["name"],
            "albumUrl" : track["album"]["external_urls"]["spotify"],
            "artistName" : track["artists"][0]["name"],
            "addedAt" : new Date().getTime(),
            "duration" : track["duration_ms"],
            "expiresAt" : nextTrackExpiresAt,  
            "imageUrl" : track["album"]["images"][2]["url"],
            "trackName" : track["name"],
            "uri" : track["uri"],
            "addedBy" : userId
        }

        console.log(new Date().getTime(), "pushing track onto playlist: ", track["name"], " expires at ", nextTrackExpiresAt);

        this.db.list('Playlist').push(playlistEntry);

    }

    addSomeTrack() {

        let track = 
        {
            "album" : {"name" : "placeholder",
                       "images" : [{"url":"poop"}, {"url":"poop"}, {"url": "placholder"}],
                       "external_urls" : {"spotify" : "https://open.spotify.com/album/6hoAjrSXyYJlJ0p9g3QjT1"}},
            "artists" : [{name: "placeholder"}],
            "duration_ms" : 6000,
            "name" : "placeholder",
            "uri" : "spotify:track:0RbfwabR0mycfvZOduSIOO"
        }

        this.pushTrack(track, "robot");
    }
}
