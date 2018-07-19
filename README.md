# DeepStrafe

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.8.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

# Project Notes

[Add link to project spec here](http://www.google.com)

## Authentication

We use the "Authorization Code" flow described in Spotify's [auth guide](https://developer.spotify.com/documentation/general/guides/authorization-guide/). Clicking "sign in with Spotify" in the app calls the `redirect` Cloud Function, which sets a cookie with a CSRF-preventing random value, and then redirects the user to the Spotify authorize URL, which then redirects back to the app with a code (and the CSRF value). (See Routing section below.)

What should happen next:

* The code and CSRF value are passed to the `token` Cloud Function
* This function: 
 * Checks the CSRF value against the one stored in the user's cookie
 * Saves the access token from Spotify to the Firebase DB for this user
 * Creates a Firebase account for the user and get a Firebase auth token back
* We then log the user in to the Firebase account

This whole pattern, and all the current deployed Cloud Function code, is stolen from [this sample project](https://github.com/firebase/functions-samples/tree/master/spotify-auth).

## Routing

The only use case for routes right now is the OAuth callback from Spotify.

We have to use the route to the root path because if we use any path other than `/` ... e.g. `/callback` ... Firebase doesn't like that. You can workaround Firebase by using so-called "HTML 5 mode" in Angular, which just adds a hashtag to the URLs like `poop.com/#/callback` ... but then Spotify doesn't like that (you have to configure Spotify dev settings with your redirect URL for OAuth).

So, we just route back to the root path. 