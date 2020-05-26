# Spotify Party Radio - Overview

I miss [Turntable.fm](https://en.wikipedia.org/wiki/Turntable.fm), the defunct service that let you share DJ duties with your friends. This is my take on some of their ideas. 

[Project Vision PDF](https://github.com/TheLoombot/spotify-party-radio/blob/master/docs/SpotifyPartyRadio.pdf)

The current PoC provides a single, shared station. Any user can choose tracks for the station. All users hear the same music at the same time, proving the core idea. 

![screenshot](/docs/screenshot.png "Work in progress")

# Technical

This is an Angular app, generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.8.

It integrates with Firebase, mostly to use Firebase's realtime database. I've also got [the app itself deployed to Firebase](https://poop-a1c0e.firebaseapp.com/), but in theory you could deploy it anywhere. Users of the app are required to authenticate with Spotify, and they must have premium Spotify accounts.

## To run the app locally

[Download Node/NPM LTS](https://nodejs.org/en/)

1. Check out the project
2. Install n: `npm install -g n` so we can choose which version of Node we want
3. Install Node @ 12.16.3: `n 12.16.3`
4. Run `npm install`
5. Run `ng serve` for a dev server. This will work with `dev` environment by default. (You can also work with `prod` environment using `ng serve --prod` instead)
6. Navigate to `http://localhost:4200/`. (You can get an access token [from a deployed instance of the app](https://poop-a1c0e.firebaseapp.com/))

To build and deploy the app
1. Run `ng build --prod; firebase deploy`. 

## Authentication

We use the "Implicit Grant" flow described in Spotify's [auth guide](https://developer.spotify.com/documentation/general/guides/authorization-guide/). Clicking "sign in with Spotify" in the app  redirects the user to the Spotify authorize URL (passing the app's Spotify Client ID), which then redirects back to the app with an access token.

We store the access token in the browser's local storage and include it as header on all subsequent HTTP requests using Angular's Interceptor functionality. 

Since authentication requires handling a callback it's tricky to do when you're running the app off localhost... but you can get an access token [from prod](https://poop-a1c0e.firebaseapp.com/) and then redirect yourself to `localhost:4200/#access_token={YOUR ACCESS TOKEN}` and things should work fine from there... until the token expires. 

Note that we are using Implicit Grant rather than "Authorization Code" flow for now because it requires no server resources. We can stay "serverless" and still get the benefit of Authorization Code flow (which requires a server, but gets you easy auth refreshes in return) using Firebase's "Cloud Funtions" features, as described [here](https://github.com/firebase/functions-samples/tree/master/spotify-auth). That's a TODO. 

## Playback

For the POC we are using [Spotify's Player Web API](https://developer.spotify.com/documentation/web-api/reference/player/start-a-users-playback/), which is effectively a remote control for another Spotify session the user has active. It even works if you have the Spotify app open and backgrounded on your mobile. The only catch is you have to have recently interacted with the player, but we can detect when the player is not active and show the user an error and prompt them to open the Spotify web player. 

A preferred approach is to use the [Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk/) but that's a whole separate integration I don't want to deal with right now. 

## Firebase

At the moment, we are using Firebase DB with wide open auth rules. 😬 

We really only use it to manage the shared playlist. No user data even goes in there right now. 
