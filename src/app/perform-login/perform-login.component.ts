import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-perform-login',
  templateUrl: './perform-login.component.html',
  styleUrls: ['./perform-login.component.css']
})
export class PerformLoginComponent implements OnInit {

  code: string; 
  tokenFunctionURL = 'https://us-central1-poop-a1c0e.cloudfunctions.net/token';

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
  	this.code = this.route.snapshot.queryParams["code"];
  }

}
