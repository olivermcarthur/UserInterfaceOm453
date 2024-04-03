import { Injectable } from '@angular/core';
import { ObjectId } from './helpers/objectId';
import { fromChangeEvent } from './custom-operators';
import { RealmAppService } from './realm-app.service';
import { Auction } from './auction';
import { filter, map } from 'rxjs/operators';

const isUpdateEvent = (event: any): event is Realm.Services.MongoDB.UpdateEvent<any> =>
  event.operationType === 'update';

@Injectable({
  providedIn: 'root'
})
export class AuctionService {
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
 // Asynchronously searches the collection using a text search
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
  ]) as Promise<Auction[]>; // Casts the result to a promise of an array of Auction objects
}

// Asynchronously loads a specified number of documents from the collection
async load(limit = 20) {
  const collection = await this.getCollection(); // Get the collection from the database
  if (!collection) {
    console.error('Failed to load collection.'); // Log an error if the collection is not loaded
    return []; // Return an empty array if the collection is not loaded
  }
  // Use MongoDB's aggregation pipeline to load documents and return them
  return collection.aggregate([
    { $sort: { ends: 1 } }, // Sort the results by the 'ends' field
    { $limit: limit }, // Limit the number of results returned
  ]) as Promise<Auction[]>; // Casts the result to a promise of an array of Auction objects
}

// Asynchronously sets up a change stream watcher on a collection for specific IDs
async getCollectionWatcher(ids: any[]) {
  if (!ids.length) {
    return; // If no IDs are provided, return early
  }
  const collection = await this.getCollection(); // Get the collection from the database
  if (!collection) {
    return; // If the collection is not loaded, return early
  }
  const objectIds = ids.map(id => new ObjectId(id)); // Convert the string IDs to ObjectId
  const generator = collection.watch({ ids: objectIds }); // Set up the change stream watcher
  // Convert the change stream to an Observable and filter/map the results
  return fromChangeEvent(generator).pipe(
    filter(isUpdateEvent), // Filter the events to only include update operations
    map(event => ({ updateDescription: event.updateDescription, _id: event.documentKey._id })) // Map the event to only include necessary data
  );
}

// Asynchronously attempts to place a bid on an auction item
async bid(auction: Auction, username: string, increment: number = 1) {
  const app = await this.realmAppService.getAppInstance(); // Get the app instance from RealmAppService
  // Call a Realm function 'bid' as the current user with the provided parameters
  app.currentUser?.functions['bid']({
    auction,
    username,
    increment
  });
}

// Private helper method to asynchronously retrieve the MongoDB collection
private async getCollection() {
  const app = await this.realmAppService.getAppInstance(); // Get the app instance from RealmAppService
  // Get the client for 'mongodb-atlas' service and the 'auctions' database, then the 'cars' collection
  const mongo = app.currentUser?.mongoClient('mongodb-atlas');
  const collection = mongo?.db('auctions').collection<Auction>('cars');
  return collection; // Return the collection object
}
}