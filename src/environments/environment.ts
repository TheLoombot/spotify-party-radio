// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  spotify: {
    clientId: '7fafbce74b0b4d78868fbdc6d6b1858b',
    apiURL: 'https://api.spotify.com/v1'
  },
  firebase: {
    apiKey: 'AIzaSyD3_6O3kgWAIa1lIxHSBmAFA_xLx07CDUE',
    authDomain: 'poop-a1c0e.firebaseapp.com',
    databaseURL: 'https://poop-a1c0e.firebaseio.com',
    projectId: 'poop-a1c0e',
    storageBucket: 'poop-a1c0e.appspot.com',
    messagingSenderId: '1004867187487'
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
