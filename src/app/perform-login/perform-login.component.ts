import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-perform-login',
  templateUrl: './perform-login.component.html',
  styleUrls: ['./perform-login.component.css']
})
export class PerformLoginComponent implements OnInit {

  tokenFunctionURL = 'https://us-central1-poop-a1c0e.cloudfunctions.net/token';
  code: string; 
  state: string;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
  	this.code = this.route.snapshot.queryParams["code"];
  	this.state = this.route.snapshot.queryParams["state"];
  }

}
