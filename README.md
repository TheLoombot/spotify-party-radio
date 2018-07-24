# DeepStrafe

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.8.

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. 

Run `ng build; firebase deploy` to build and deploy the project. 

# Project Notes

[Project Spec](https://github.com/TheLoombot/deep-strafe/blob/master/DeepState.pdf)

Though originally conceived as a native iOS App that integrates with Apple Music, I'm trying to build a proof of concept for the web instead, using Spotify (since more people I know have Spotify). However this PoC retains some of the spec's ideas: serverless design using Firebase as a backend, and the basic user experience.

Goals in priority order:

1. (DONE) Get basic auth working in an Angular app deployed to Firebase authenticating via Spotify.
2. Verify auth works by building basic search and playback functions
3. Create a basic list of users (all users in the system) and for each, allow the user to add songs to her own station
4. Listen to other user's stations according to the spec's 

## Authentication

We use the "Implicit Grant" flow described in Spotify's [auth guide](https://developer.spotify.com/documentation/general/guides/authorization-guide/). Clicking "sign in with Spotify" in the app  redirects the user to the Spotify authorize URL (passing the app's Spotify Client ID), which then redirects back to the app with an access token.

We store the access token in the browser's local storage and include it as header on all subsequent HTTP requests using Angular's Interceptor functionality. 


