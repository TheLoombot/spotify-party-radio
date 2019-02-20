import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

// Keeps track of the length of the tracks child list in playlist
export const countPlaylistTrackWrite = functions.database
  .ref('/stations/{stationid}/{environment}/lists/playlist/{trackid}')
  .onWrite(
    async (change) => {
      const collectionRef = change.after.ref.parent;
      const countRef = collectionRef.parent.child('playlist_count');
      let increment;
      if (change.after.exists() && !change.before.exists()) {
        increment = 1;
      } else if (!change.after.exists() && change.before.exists()) {
        increment = -1;
      } else {
        return null;
      }
      await countRef.transaction(
        (current) => {
          return (current || 0) + increment;
        }
      );
      return null;
    }
  );

// If the playlist_count gets deleted, recount the number of tracks in playlist
export const recountPlaylistTrack = functions.database
  .ref('/stations/{stationid}/{environment}/lists/playlist_count')
  .onDelete(
    async (snap) => {
      const counterRef = snap.ref;
      const collectionRef = counterRef.parent.child('playlist');
      const tracksData = await collectionRef.once('value');
      await counterRef.set(tracksData.numChildren());
    }
  );

// Keeps track of the length of the tracks child list in previouslist
export const countPreviouslistTrackWrite = functions.database
  .ref('/stations/{stationid}/{environment}/lists/previouslist/{trackid}')
  .onWrite(
    async (change) => {
      const collectionRef = change.after.ref.parent;
      const countRef = collectionRef.parent.child('previouslist_count');
      let increment;
      if (change.after.exists() && !change.before.exists()) {
        increment = 1;
      } else if (!change.after.exists() && change.before.exists()) {
        increment = -1;
      } else {
        return null;
      }
      await countRef.transaction(
        (current) => {
          return (current || 0) + increment;
        }
      );
      return null;
    }
  );

// If the playlist_count gets deleted, recount the number of tracks in previouslist
export const recountPreviouslistTrack = functions.database
  .ref('/stations/{stationid}/{environment}/lists/previouslist_count')
  .onDelete(
    async (snap) => {
      const counterRef = snap.ref;
      const collectionRef = counterRef.parent.child('previouslist');
      const tracksData = await collectionRef.once('value');
      await counterRef.set(tracksData.numChildren());
    }
  );