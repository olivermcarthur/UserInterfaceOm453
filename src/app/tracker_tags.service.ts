import { Injectable } from '@angular/core';
import { ObjectId } from './helpers/objectId';
import { fromChangeEvent } from './custom-operators';
import { RealmAppService } from './realm-app.service';
import { TrackingTag } from './tracker_tags';
import { filter, map } from 'rxjs/operators';

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
    filter(event => 
      event.operationType === 'insert' || 
      event.operationType === 'delete' || 
      event.operationType === 'update'
    ),
    map(event => {
      switch (event.operationType) {
        case 'insert': {
          const insertEvent = event as Realm.Services.MongoDB.InsertEvent<TrackingTag>;
          console.log('Insert event:', insertEvent);
          return {
            operationType: insertEvent.operationType,
          };
        }
        case 'delete': {
          const deleteEvent = event as Realm.Services.MongoDB.DeleteEvent<TrackingTag>;
          console.log('Delete event:', deleteEvent);
          return {
            operationType: deleteEvent.operationType,
          };
        }
        case 'update': {
          const updateEvent = event as Realm.Services.MongoDB.UpdateEvent<TrackingTag>;
          return {
            documentKey: updateEvent.documentKey,
            updateDescription: updateEvent.updateDescription,
            operationType: updateEvent.operationType,
            fullDocument: updateEvent.fullDocument,
          };
        }
        default: {
          // Log unexpected operation type and return null or some default object
          console.log('Unexpected operationType:', event.operationType);
          return null; // or return { operationType: event.operationType };
        }
      }
    }),
    filter(result => result !== null) // This will filter out the null results
  );
}


// Private helper method to asynchronously retrieve the MongoDB collection
private async getCollection() {
  const app = await this.realmAppService.getAppInstance(); // Get the app instance from RealmAppService
  // Get the client for 'mongodb-atlas' service and the 'auctions' database, then the 'cars' collection
  const mongo = app.currentUser?.mongoClient('mongodb-atlas');
  const collection = mongo?.db('Demo2').collection<TrackingTag>('T_tags');
  console.log("Collection object is :", collection)

  if (!collection) {
    throw new Error('Failed to connect to server.');
  } 
  return collection; // Return the collection object
}
}