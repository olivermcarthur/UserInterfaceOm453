import { Injectable } from '@angular/core';
import { ObjectId } from './helpers/objectId';
import { RealmAppService } from './realm-app.service';
import { Receiver } from './receiver';

@Injectable({
  providedIn: 'root'
})
export class ReceiverService {
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
  ]) as Promise<Receiver[]>; // Casts the result to a promise of an array of Auction objects
}


// Private helper method to asynchronously retrieve the MongoDB collection
private async getCollection() {
  const app = await this.realmAppService.getAppInstance(); // Get the app instance from RealmAppService
  // Get the client for 'mongodb-atlas' service and the 'auctions' database, then the 'cars' collection
  const mongo = app.currentUser?.mongoClient('mongodb-atlas');
  const collection = mongo?.db('Test2').collection<Receiver>('Receivers');
  console.log("Collection object is :", collection)

  if (!collection) {
    throw new Error('Failed to connect to server.');
  } 
  return collection; // Return the collection object
}
}