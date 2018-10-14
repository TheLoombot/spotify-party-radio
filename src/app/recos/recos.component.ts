import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../spotify.service';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { PlaylistService } from '../playlist.service';

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

    constructor(private spotify: SpotifyService, private playlistSvc: PlaylistService) { 

        this.lastFivePlaylistRef = playlistSvc.getLastTracks(5)

        this.lastFivePlaylistRef.valueChanges().pipe(debounceTime(2000)).subscribe 
        (data => {
            let tracks = data
            this.lastFiveTrackUris = "";
            for (let track in tracks) {
                this.lastFiveTrackUris += tracks[track]["uri"].replace("spotify:track:","")
                this.lastFiveTrackUris += ","
            }

            this.refreshRecos();

        },
        error => {
            console.log("playlist retrieve error for recos: ", error)
        });
    }

    ngOnInit() {
    }

    pushTrack(track: Object, i: number) {
        this.clicked = i;
        this.playlistSvc.pushTrack(track);
    }

    refreshRecos() {
        this.spotify.getRecos(this.lastFiveTrackUris)
        .subscribe(data => {
            this.recos = data
            this.clicked = -1;
        },
        error => {
            this.recoError = error.error.error
        });
    }
}
