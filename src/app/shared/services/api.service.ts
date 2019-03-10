import { Injectable } from '@angular/core';
import { HttpClient,  HttpHeaders, HttpErrorResponse } from '@angular/common/http';
/* RxJs */
import { Observable, Subscription } from 'rxjs';
import { map, filter, scan, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
/* Models */
import { User } from '../models/user';
import { Track } from '../models/track';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl: string;

  constructor(
    private http: HttpClient
  ) {
    this.baseUrl = 'https://us-central1-poop-a1c0e.cloudfunctions.net/';
  }

  getRandomPreviousListTrack(station: string, environment: string): Observable<Track> {
    const url = `${this.baseUrl}/getRandomPreviousTrack`;
    const httpOptions = {
      headers: new HttpHeaders(
        {
          'Content-Type': 'application/json'
        }
      )
    };
    const body = JSON.stringify(
      {
        station: station,
        environment: environment
      }
    );

    return this.http.post(url, body, httpOptions)
      .pipe(
        map((response: any) => response),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }
}
