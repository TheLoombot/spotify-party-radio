import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
/* Services */
import { PlaylistService } from '../shared/services/playlist.service';
import { SpotifyService } from '../shared/services/spotify.service';
import { Track } from '../shared/models/track';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css']
})
export class PlaylistComponent implements OnInit, OnDestroy {

  @Input() currentStation: string;
  tracks: Object;
  trackSub;
  poolTracks: Object;
  poolTracksSub;

  constructor(
    private playlistService: PlaylistService,
    private spotifyService: SpotifyService,
    ) {
  }

  ngOnInit() {
    // ngOnChanges() is called on init! so nothing to do here
  }

  ngOnChanges(changes: SimpleChanges) {
    this.tuneToStation(changes['currentStation'].currentValue);
  }

  tuneToStation(stationName: string) {
    this.trackSub?.unsubscribe();
    this.trackSub = this.playlistService.getAllTracks()
    .subscribe(
      tracks => {
        this.tracks = tracks;
        console.log(`Playlist update, new size: ${this.tracks['length']}`);
      },
      error => console.error('Playlist retrieve error: ', error)
      );
    this.poolTracksSub?.unsubscribe();
    this.poolTracks = this.playlistService.getAllPreviousTracks()
    .subscribe(
      tracks => {
        this.poolTracks = tracks;
        console.log(`Pool update, new size: {this.poolTracks['length']}`);
      },
      error =>console.error('pool tracks retrieve error: `', error)
      );

  }

  userOwnsStation(): boolean {
    if (this.currentStation === this.spotifyService.getUserName()) return true;
    return false;
  }

  // You can remove tracks if it's your station, or if you just added the track
  // to someone else's station... but not if it came out of the pool via Robot DJ
  canRemoveTrack(track: Track): boolean {
    if (this.userOwnsStation()) return true;

    // if (track.player) return false;
    // if (track.added_by === this.spotifyService.getUserName()) return true;
    return false;
  }

  removeTrack(track: any, i: number): void {
    // add 1 to the index because we slice off the first track
    i++;
    console.log(`Clicked to remove ${track.name}`);
    this.playlistService.remove(track.key, i);
    track['added_at'] = this.getTime();
    this.playlistService.saveTrack(track);
  }

  private getTime(): number {
    return new Date().getTime();
  }

  ngOnDestroy() {
    this.trackSub.unsubscribe();
  }

}
