import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TrackerTagService } from '../tracker_tags.service';
import { TrackingTag } from '../tracker_tags';
import { BSON } from 'realm-web';

@Component({
  selector: 'app-auction-catalogue',
  templateUrl: './tracking-tags.component.html',
  styleUrls: ['./tracking-tags.component.scss']
})

export class TrackerTagComponent implements OnInit, OnDestroy {
  private updatesSubscription: Subscription;
  trackingTags: TrackingTag[] = [];

  constructor(private trackingTagService: TrackerTagService) {  }

  async ngOnInit(): Promise<void> {
    console.log('Component initializing and loading tracking tags...');
    this.trackingTags = await this.trackingTagService.load();
    console.log('Initial tracking tags loaded:', this.trackingTags);

    const watcher = await this.trackingTagService.getCollectionWatcher();
    if (!watcher) {
      console.error('Failed to obtain collection watcher.');
      return;
    }

    this.updatesSubscription = watcher.subscribe({
      next: (update: any) => {
        console.log('Change stream update received:', update);
        this.updateTrackingTag(update);
      },
      error: (error) => console.error('Error receiving updates:', error)
    });
  }

  ngOnDestroy(): void {
    this.updatesSubscription?.unsubscribe();
    console.log('Unsubscribed from collection watcher.');
  }

  private updateTrackingTag(update: any) {
    console.log('Attempting to update tracking tag with:', update);

    if (!update.documentKey?._id) {
      console.error('Update object is missing documentKey or _id:', update);
      return;
    }
    // Attempts to find the index of the tracking tag in the local array (this.trackingTags)
    // that matches the _id of the updated tag from the update object.
    const updatedTagIndex = this.trackingTags.findIndex(tag => {
      // Convert ObjectId to string if necessary
      const localId = tag._id instanceof BSON.ObjectId ? tag._id.toString() : tag._id;
      const updateId = update.documentKey._id instanceof BSON.ObjectId ? update.documentKey._id.toHexString() : update.documentKey._id;

      // Log both IDs to compare them
      console.log(`Local tag _id: ${localId}, Update object _id: ${updateId}`);

      // Check if they match
      return localId === updateId;
    });

    // console.log ("this.trackingTags = ", this.trackingTags[updatedTagIndex])
    // console.log("tag data from update = ", update.updateDescription)

    if (updatedTagIndex !== -1) {
      // If the update includes the fullDocument, replace the local object entirely
      if (update.fullDocument) {
        this.trackingTags[updatedTagIndex] = update.fullDocument;
        console.log('Replaced with full document, and is now:', this.trackingTags[updatedTagIndex]);
      } 
      else {
        // If only updated fields are provided, merge them with the existing object
        // const updatedFields = update.updateDescription?.updatedFields;
        // if (updatedFields) {
        //   // Merge existing fields with updatedFields
        //   Object.assign(this.trackingTags[updatedTagIndex], updatedFields);
        //   console.log('Merged updated fields:', this.trackingTags[updatedTagIndex]);
        // }
    
        // If there are removed fields provided in the update description
        const removedFields = update.updateDescription?.removedFields;
        if (removedFields) {
          // Remove the fields that are not present in updatedFields
          removedFields.forEach((field: string) => {
            delete (this.trackingTags[updatedTagIndex] as any)[field];
          });
          console.log('Removed specified fields:', this.trackingTags[updatedTagIndex]);
        }
      console.log("Update complete")
      }
    } 
    else {
      console.log('No matching tracking tag found in local data for update:', update);
    }
  }
}
