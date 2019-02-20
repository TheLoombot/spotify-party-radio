import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
/* Models */
import { State } from './shared/models/state';
/* Services */
import { StateService } from './shared/services/state.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
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
          this.appEnabled = state.enabled;
          console.log('State obtained in app:', this.state);
        },
        error => console.error(error),
        () => {
          this.cdr.detectChanges();
        }
      );
  }
}

