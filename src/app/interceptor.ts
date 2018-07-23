import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class Interceptor implements HttpInterceptor {

	constructor() { }

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

		console.log("stored access token is", window.localStorage.getItem("access_token"));

		const authReq = req.clone({
			setHeaders: {
				Authorization: `Bearer ${window.localStorage.getItem("access_token")}`
			}
		});

		return next.handle(authReq)
	}

}
