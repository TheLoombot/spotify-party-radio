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
    console.log('Next state:', state);
    this.stateSubject.next(state);
  }

  clearState(): void {
    this.stateSubject.next();
  }

  getState(): Observable<State> {
    return this.stateSubject.asObservable();
  }

}
