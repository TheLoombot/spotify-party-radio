import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpModule } from '@angular/http';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-perform-login',
  templateUrl: './perform-login.component.html',
  styleUrls: ['./perform-login.component.css']
})
export class PerformLoginComponent implements OnInit {

  params: string[];

  access_token: string; 

  constructor(private route: ActivatedRoute, public http: HttpClient) { }

  ngOnInit() {
    // The "fragment" is hash fragment, which we can access only as a string
    if (this.route.snapshot.fragment) {
      this.params = this.route.snapshot.fragment.split("&");
      for (let paramString of this.params) {
        let paramArray = paramString.split("=");
        if (paramArray[0]=="access_token") {
          this.access_token = paramArray[1];
          window.localStorage.setItem("access_token", this.access_token);
        }
      }
    }

    this.http.get('https://api.spotify.com/v1/artists/1vCWHaC5f2uS3yhpwWbIA6/albums?album_type=SINGLE&offset=20&limit=10')
    .subscribe(
      data => console.log(data),
      err => console.log(err)
      );


  }

}