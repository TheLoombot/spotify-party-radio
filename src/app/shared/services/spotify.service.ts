import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
/* RxJs */
import { Observable, Subject } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { combineLatest } from 'rxjs';
/* Models */
import { User } from '../models/user';
/* Others */
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  token: string;
  private tokenSubject: Subject<any>;
  user: User;
  authorizeURL = 'https://accounts.spotify.com/authorize';
  clientId: string;
  responseType: string;
  redirectURI = 'https://' + window.location.hostname;
  scope = [
    'user-read-email',
    'user-read-currently-playing',
    'user-modify-playback-state',
    'streaming',
    'user-read-playback-state',
    'user-read-private',
    'user-top-read'
  ].join('%20');
  baseUrl: string;

  constructor(
    private http: HttpClient
  ) {
    this.token = '';
    this.tokenSubject = new Subject<any>();
    this.clientId = environment.spotify.clientId;
    this.responseType = 'token';
    this.baseUrl = environment.spotify.apiURL;
  }

  setToken(token: string): void {
    this.token = token;
    console.log('SpotifyService token:', this.token);
  }

  getToken(): string {
    return this.token;
  }

  isTokenAvailable(): boolean {
    return this.token ? true : false;
  }

  /** Method to send token using the tokenSubject */
  sendToken(token: string): void {
    console.log('New token:', token);
    this.tokenSubject.next({ token: token });
  }

  clearToken(): void {
    this.tokenSubject.next();
  }

  getTokens(): Observable<any> {
    return this.tokenSubject.asObservable();
  }

  setUser(user: User): void {
    this.user = user;
  }

  getUser(): User {
    return this.user;
  }

  /** Get Current User's Profile */
  getUserProfile() {
    return this.http.get(this.baseUrl + '/me');
  }

  getNowPlaying() {
    return this.http.get(this.baseUrl + '/me/player/currently-playing');
  }

  getAuthUrl(): string {
    this.authorizeURL += '?' + 'client_id=' + this.clientId;
    this.authorizeURL += '&response_type=' + this.responseType;
    this.authorizeURL += '&redirect_uri=' + this.redirectURI;
    this.authorizeURL += '&scope=' + this.scope;
    return this.authorizeURL;
  }

  search(terms: Observable<string>, offset: Observable<number>) {
    return combineLatest(offset, terms.pipe(debounceTime(400), distinctUntilChanged()))
    .pipe(switchMap(([offset, term]) => (term && term.trim().length > 0) ?
    this.searchEntries(term, offset)
    :
    of([])
    ));
  }

  searchEntries(term: string, offset: number) {
    console.log('🕵🏽‍♀️', term, 'offset', offset);
    return this.http.get(this.baseUrl + '/search?type=track,album,artist&offset=' + offset + '&limit=5&q=' + term);
  }

  playTrack(uri: string) {
    const bodyObj = {
      'uris': [uri]
    };
    // console.log(new Date().getTime(), "attempting to play ", uri);
    return this.http.put(this.baseUrl + '/me/player/play', JSON.stringify(bodyObj));
  }

  seekTrack(offset: number) {
    if (offset < 2000) return of([]);
    console.log(new Date().getTime(), ' seeking to position ', offset);
    return this.http.put(this.baseUrl + '/me/player/seek?position_ms=' + offset, null);
  }

  getRecos(ids: string) {
    if (ids) {
      return this.http.get(this.baseUrl + '/recommendations?limit=5&min_popularity=50&seed_tracks=' + ids);
    } else {
      return of([]);
    }
  }

  getTopTracks() {
    return this.http.get(this.baseUrl + '/me/top/tracks?limit=5&time_range=short_term');
  }

}
