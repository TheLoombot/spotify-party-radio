import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
/* Services */
import { StateService } from './shared/services/state.service';
/* Models */
import { State } from './shared/models/state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  appEnabled: boolean;
  state: State;

  constructor (
    private cdr: ChangeDetectorRef,
    private stateService: StateService,
  ) {
    this.appEnabled = false; // Disable components
  }

  ngOnInit () {
    this.stateService.getState()
      .subscribe(
        (state: State) => {
          this.state = state;
          console.log('State obtained in app:', this.state);
          if (state.enabled) {
            this.appEnabled = true;
          } else {
            this.appEnabled = false;
            console.error(this.state.error);
          }
        },
        error => console.error(error),
        () => {
          console.warn('New State processed');
          this.cdr.detectChanges();
        }
      );
  }
}

