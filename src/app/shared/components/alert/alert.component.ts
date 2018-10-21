import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
/* Models */
import { Error } from '../../models/error';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit, OnChanges {
  @Input() error: Error;

  constructor() { }

  ngOnInit() {
    console.warn(this.error);
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    // changes.prop contains the old and the new value...
  }

}
