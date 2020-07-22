import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
/* RxJs */
import { Observable, Subject } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
/* Models */
import { State } from '../models/state';
/* Others */
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private stateSubject: Subject<State>;

  constructor () {
    this.stateSubject = new Subject<State>();
  }

  sendState(state: State): void {
    this.stateSubject.next(state);
  }

  clearState(): void {
    this.stateSubject.next();
  }

  getState(): Observable<State> {
    return this.stateSubject.asObservable();
  }

  /** Method to create an error state and broadcast it using the state subject */
  sendError(message: string, code?: number): void {
    const errorState: State = {
      enabled: false,
      error: {
        code: code,
        message: message
      }
    };
    this.sendState(errorState);
    window.localStorage.removeItem('access_token');
  }

}
