import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-error-alert',
  templateUrl: './error-alert.component.html',
  styleUrls: ['./error-alert.component.css']
})
export class ErrorAlertComponent implements OnInit {

  errorMessage: String;

  @Input() error;

  constructor() {
  }

  ngOnInit() {
  }

}
