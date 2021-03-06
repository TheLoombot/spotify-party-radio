import { Component, OnInit, OnChanges, SimpleChanges, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
/* Services */
import { StateService } from '../../services/state.service';
/* Models */
import { Error } from '../../models/error';
import { State } from '../../models/state';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {
  error: Error;

  constructor(
    private stateService: StateService
  ) { }

  ngOnInit() {
    this.stateService.getState()
      .subscribe(
        (state: State) => {
          this.error = state.error;
        }
      );
  }

}
