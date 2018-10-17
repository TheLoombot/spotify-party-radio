import { Component, OnInit } from '@angular/core';
/* Services */
import { StateService } from './shared/services/state.service';
/* Models */
import { State } from './shared/models/state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  appEnabled: boolean;
  state: State;

  constructor (
    private stateService: StateService
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
        }
      );
  }
}

