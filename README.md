# Overview

I miss [Turntable.fm](https://en.wikipedia.org/wiki/Turntable.fm), the defunct service that let you share DJ duties with your friends. This is my take on some of their ideas. 

[Project Vision PDF](https://github.com/TheLoombot/deep-strafe/blob/master/docs/DeepState.pdf)

Though originally conceived as a native iOS App that integrates with Apple Music, I'm trying to build a proof of concept for the web instead, using Spotify (since more people I know have Spotify). However this PoC retains some of the spec's ideas: serverless design using Firebase as a backend, and the basic user experience.

# Technical

This is an Angular app, generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.8.

It integrates with Firebase, mostly to use Firebase's realtime database. I've also got [the app itself deployed to Firebase](https://poop-a1c0e.firebaseapp.com/), but in theory you could deploy it anywhere. Users of the app are required to authenticate with Spotify, and they must have premium Spotify accounts.

To run the app locally: 

1. Check out the project
2. Use npm to install the angular cli (to build) and firebase tools (to deploy)
3. Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. (You can get an access token [from a deployed instance of the app](https://poop-a1c0e.firebaseapp.com/))
4. Run `ng build; firebase deploy` to build and deploy the project. 

# Planning

## Short-term Goals

1. (DONE) Get basic auth working in an Angular app deployed to Firebase authenticating via Spotify.
2. (DONE) Verify auth works by building basic search and playback functions
3. (DONE) Create a single shared playlist in Firebase, test that multiple users can add to it 
4. (DONE) Implement the specific playback management functionality described in the vision doc
5. Stop and see if any of this makes sense so far, before trying to create the true multi-user experience

We're at Step 5... a basic, single shared playlist that multiple users can append tracks to, and experience listening synchronized among clients, has been built. So far it mostly works for 2 people at a time. Right now there's bugs to fix and smaller immediate features to build even for this basic version of the product ... so it might be a minute of testing and experimentation at this phase before I commit to building anything huge. 

![screenshot](/docs/Screen%20Shot%202018-08-01%20at%2012.22.51%20AM.png "Work in progress")

## Potential Next Steps

1. Auto-populate the playlist if it goes empty. Could do this from a pool of previously-played tracks. Or, from the signed-in user's recos.
2. Refactor authentication and playlists into services, instead of the janky implementation they both use now. This will allow things like updating the login component when the player component detects an expired session.
3. And/or: Build proper Spotify authentication with renewing tokens. Expiration is annoying, it's just like an hour of listening.
4. Build stuff to suggest tracks to users... maybe just Spotify's default recos? Could appear as contents of the search results component when there's no active query.
5. Delete from playlist (and skip). To start we could just allow deleting the last track in the playlist, since that won't require any math. But deleting any other track is a more complex operation that requires adjusting all subsequent tracks in the playlist (expiration times).

## Other Cute Ideas

1. The "mother of all playlists" ... everyone in the world gets to add exactly one track. It's playing continuously and you can see all past and future tracks. 
2. Playlist-making games: Round-robin responsibility for adding the next track. Or challenge people to pick a song in response to what you just picked. TT.fm was structured around five people doing this at a time.
3. There almost certainly needs to be *some* kind of feedback channel from listeners, as simple as a listener count or "likes" and as complex as live chat. What about something like Soundcloud, where comments are tied to timestamps in a song? And show every time that particular track gets played again? 

# Notes

## Authentication

We use the "Implicit Grant" flow described in Spotify's [auth guide](https://developer.spotify.com/documentation/general/guides/authorization-guide/). Clicking "sign in with Spotify" in the app  redirects the user to the Spotify authorize URL (passing the app's Spotify Client ID), which then redirects back to the app with an access token.

We store the access token in the browser's local storage and include it as header on all subsequent HTTP requests using Angular's Interceptor functionality. 

Since authentication requires handling a callback it's tricky to do when you're running the app off localhost... but you can get an access token [from prod](https://poop-a1c0e.firebaseapp.com/) and then manually redirect yourself to `localhost:4200/#access_token={YOUR ACCESS TOKEN}` and things should work fine from there... until the token expires. 

Note that we are using Implicit Grant rather than "Authorization Code" flow for now because it requires no server resources. We can stay "serverless" and still get the benefit of Authorization Code flow (which requires a server, but gets you easy auth refreshes in return) using Firebase's "Cloud Funtions" features, as described [here](https://github.com/firebase/functions-samples/tree/master/spotify-auth). That's a TODO. 

## Playback

For the POC we are using [Spotify's Player Web API](https://developer.spotify.com/documentation/web-api/reference/player/start-a-users-playback/), which is effectively a remote control for another Spotify session the user has active. It even works if you have the Spotify app open and backgrounded on your mobile. The only catch is you have to have recently interacted with the player, but we can detect when the player is not active and show the user an error and prompt them to open the Spotify web player. 

A preferred approach is to use the [Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk/) but that's a whole separate integration I don't want to deal with right now. 
