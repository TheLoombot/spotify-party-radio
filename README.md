# DeepStrafe

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.8.

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. 

Run `ng build; firebase deploy` to build and deploy the project. 

# Project Notes

[Project Vision PDF](https://github.com/TheLoombot/deep-strafe/blob/master/DeepState.pdf)

Though originally conceived as a native iOS App that integrates with Apple Music, I'm trying to build a proof of concept for the web instead, using Spotify (since more people I know have Spotify). However this PoC retains some of the spec's ideas: serverless design using Firebase as a backend, and the basic user experience.

Short term goals in priority order:

1. (DONE) Get basic auth working in an Angular app deployed to Firebase authenticating via Spotify.
2. (DONE) Verify auth works by building basic search and playback functions
3. Create a single shared playlist in Firebase, test that multiple users can add to it 
4. Implement the specific playback management functionality described in the spec
5. Stop and see if any of this makes sense so far, before trying to create the true multi-user experience

## Authentication

We use the "Implicit Grant" flow described in Spotify's [auth guide](https://developer.spotify.com/documentation/general/guides/authorization-guide/). Clicking "sign in with Spotify" in the app  redirects the user to the Spotify authorize URL (passing the app's Spotify Client ID), which then redirects back to the app with an access token.

We store the access token in the browser's local storage and include it as header on all subsequent HTTP requests using Angular's Interceptor functionality. 

Since authentication requires handling a callback it's tricky to do when you're running the app off localhost... but you can get an access token [from prod](https://poop-a1c0e.firebaseapp.com/) and then manually redirect yourself to `localhost:4200/#access_token={YOUR ACCESS TOKEN}` and things should work fine from there... until the token expires. 

Note that we are using Implicit Grant rather than "Authorization Code" flow for now because it requires no server resources. We can stay "serverless" and still get the benefit of Authorization Code flow (which requires a server, but gets you easy auth refreshes in return) using Firebase's "Cloud Funtions" features, as described [here](https://github.com/firebase/functions-samples/tree/master/spotify-auth). That's a TODO. 

## Playback

For the POC we are using [Spotify's Player Web API](https://developer.spotify.com/documentation/web-api/reference/player/start-a-users-playback/), which is effectively a remote control for another Spotify session the user has active. It even works if you have the Spotify app open and backgrounded on your mobile. The only catch is you have to have recently interacted with the player, but we can detect when the player is not active and show the user an error and prompt them to open the Spotify web player. 

A preferred approach is to use the [Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk/) but that's a whole separate integration I don't want to deal with right now. 