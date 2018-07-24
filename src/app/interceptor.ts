import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class Interceptor implements HttpInterceptor {

	constructor() { }

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {


		if (window.location.hostname=="localhost") {
			const authReq = req.clone({
				setHeaders: {
					// hardcode an access token here since we can't take a callback to localhost
					Authorization: `Bearer BQDjGq07TQAXFPFlbRLcN9SUBcD1nOd0idfB9BKvKR3AuUkRGUfQc4rcbIhHKx-Q85mh9UmUcLoli4JcanpzLhQoi8Q80Z0fpTgZoUmBjJTJ0bpzIA-bl_YBZbZ38IwXO-5lLAzYfnJzlA9B5FgA5P9GrNqRzoY`
				}
			});
			return next.handle(authReq)
		} else { 
			// console.log("stored access token is", window.localStorage.getItem("access_token"));
			const authReq = req.clone({
				setHeaders: {
					Authorization: `Bearer ${window.localStorage.getItem("access_token")}`
				}
			});
			return next.handle(authReq)
		}
	}
}
