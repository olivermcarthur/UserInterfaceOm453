import { Injectable } from '@angular/core';
import { ObjectId } from './helpers/objectId';
import { fromChangeEvent } from './custom-operators';
import { RealmAppService } from './realm-app.service';
import { TrackingTag } from './tracker_tags';
import { filter, map } from 'rxjs/operators';
import { BSON } from 'realm-web';


// const isRelevantEvent = (event: any): event is Realm.Services.MongoDB.ChangeEvent<any> =>
//   event.operationType === 'insert' ||
//   event.operationType === 'update' ||
//   event.operationType === 'delete';

// Use the same Location interface as in tracker_tags.ts
export interface Location {
  x: BSON.Decimal128;
  y: BSON.Decimal128;
}

@Injectable({
  providedIn: 'root'
})
export class TrackerTagService {
    // The service constructor, automatically injecting an instance of RealmAppService
  constructor(private realmAppService: RealmAppService) {
  }
  // Asynchronously retrieves a single document from the collection by its ID
  async findOne(id: any) {
    const collection = await this.getCollection(); // Get the collection from the database
    if (!collection) {// Throw an error to be caught by the calling code
      console.error('Failed to load collection.');
      throw new Error('No item found.');
    }

    return collection.findOne({ _id: new ObjectId(id)}); // Return the document with the specified ID
  }
 //Asynchronously searches the collection using a text search - think this was for the search bar
 async search(query: string) {
  const collection = await this.getCollection(); // Get the collection from the database
  // Use MongoDB's aggregation pipeline to perform the search and return a promise of the results
  return collection?.aggregate([
    {
      $search: {
        index: 'auctions_search', // Specifies the index to use for the search
        autocomplete: { // Specifies that an autocomplete search should be used
          path: 'name', // The field in the document to search
          query, // The search string
        }
      }
    },
    {
      $limit: 5 // Limit the number of results returned
    },
    {
      $project: { // Specifies the fields to return in the results
        _id: 1,
        name: 1,
      }
    }
  ]) as Promise<TrackingTag[]>; // Casts the result to a promise of an array of Auction objects
}

// Asynchronously loads a specified number of documents from the collection
async load() {
  const collection = await this.getCollection(); // Get the collection from the database
  if (!collection) {
    console.error('Failed to load collection.'); // Log an error if the collection is not loaded
    return []; // Return an empty array if the collection is not loaded
  }
  // Use MongoDB's aggregation pipeline to load documents and return them
  return collection.aggregate([
    { $sort: { TagID: 1 } }, // Sort the results by the 'ends' field
  ]) as Promise<TrackingTag[]>; // Casts the result to a promise of an array of Auction objects
}

// Asynchronously sets up a change stream watcher on a collection for specific IDs
async getCollectionWatcher() {
  const collection = await this.getCollection(); // Get the collection from the database
  if (!collection) {
    return; // If the collection is not loaded, return early
  }
  const generator = collection.watch({}); // Set up the change stream watcher
  // Convert the change stream to an Observable and filter/map the results
  return fromChangeEvent(generator).pipe(
    map(event => ({
      operationType: event.operationType,
      clusterTime: event.clusterTime,
      updateDescription: event._id,
    }))
  );
}

// Asynchronously attempts to place a bid on an auction item
// async bid(auction: TrackingTag, username: string, increment: number = 1) {
//   const app = await this.realmAppService.getAppInstance(); // Get the app instance from RealmAppService
//   // Call a Realm function 'bid' as the current user with the provided parameters
//   app.currentUser?.functions['bid']({
//     auction,
//     username,
//     increment
//   });
// }

// Private helper method to asynchronously retrieve the MongoDB collection
private async getCollection() {
  const app = await this.realmAppService.getAppInstance(); // Get the app instance from RealmAppService
  // Get the client for 'mongodb-atlas' service and the 'auctions' database, then the 'cars' collection
  const mongo = app.currentUser?.mongoClient('mongodb-atlas');
  const collection = mongo?.db('Test1').collection<TrackingTag>('T_tags');

  if (!collection) {
    throw new Error('Failed to connect to server.');
  } 

  return collection; // Return the collection object
}
}