import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TrackerTagService } from '../tracker_tags.service';
import { TrackingTag } from '../tracker_tags';

@Component({
  selector: 'app-auction-catalogue',
  templateUrl: './tracking-tags.component.html',
  styleUrls: ['./tracking-tags.component.scss']
})
export class TrackerTagComponent implements OnInit, OnDestroy {
  private updatesSubscription: Subscription;
  trackingTags: TrackingTag[] = []; // Store the tracking tags

  constructor(private trackingTagService: TrackerTagService) {  }

  async ngOnInit(): Promise<void> {
    // Assume load() method exists and fetches tracking tags
    this.trackingTags = await this.trackingTagService.load();

    // Assume getCollectionWatcher() method is properly implemented to watch TrackingTag collection
    const watcher = await this.trackingTagService.getCollectionWatcher();
    
    if (!watcher) {
      return;
    }

    this.updatesSubscription = watcher.subscribe({
      next: (update: any) => {
        this.updateTrackingTag(update);
      }
    });
  }

  ngOnDestroy(): void {
    this.updatesSubscription?.unsubscribe();
  }

  private updateTrackingTag(update: any) {
    // Find the index of the tracking tag in the local array that matches the _id of the updated tag
    const updatedTagIndex = this.trackingTags.findIndex(tag => tag._id === update.documentKey._id);
  
    // Check if the updated tracking tag is found in the local array
    if (updatedTagIndex !== -1) {
      // If the update includes the entire updated document (fullDocument),
      // replace the existing tag at the found index with the new document.
      if (update.fullDocument) {
        this.trackingTags[updatedTagIndex] = update.fullDocument;
      } else {
        // If the update does not include the full document, but rather just the fields that changed,
        // we apply those individual field updates to the existing tag.
        
        // update.updateDescription.updatedFields contains the fields that have changed
        // If it does not exist, default to an empty object.
        const updatedFields = update.updateDescription?.updatedFields || [];
        
        // Iterate over the updated fields and update the corresponding fields
        // in the existing tracking tag at the found index.
        Object.keys(updatedFields).forEach(field => {
          (this.trackingTags[updatedTagIndex] as any)[field] = updatedFields[field];
        });
      }
    }
  }
  
}
