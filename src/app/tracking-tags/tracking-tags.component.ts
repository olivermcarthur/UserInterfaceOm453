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

    const updatedTagIndex = this.trackingTags.findIndex(tag => tag._id === update.documentKey._id.toString());
    console.log(`Index of updated tag: ${updatedTagIndex}`);

    if (updatedTagIndex !== -1) {
      if (update.fullDocument) {
        console.log('Received fullDocument:', update.fullDocument);
        this.trackingTags[updatedTagIndex] = update.fullDocument;
      } else {
        const updatedFields = update.updateDescription?.updatedFields || [];
        console.log('Updated fields:', updatedFields);
        
        Object.keys(updatedFields).forEach(field => {
          console.log(`Updating field ${field}:`, updatedFields[field]);
          (this.trackingTags[updatedTagIndex] as any)[field] = updatedFields[field];
        });
      }

        // Check if the updated tracking tag includes location information
      if (update.fullDocument?.location || update.updateDescription?.updatedFields?.location) {
        console.log('Location information in update:', update.fullDocument?.location || update.updateDescription.updatedFields.location);
      } else {
        console.log('No matching tracking tag found in local data for update:', update);
      }
    }
  }
}