import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TrackerTagService } from '../tracker_tags.service';
import { TrackingTag } from '../tracker_tags';

@Component({
  selector: 'app-auction-catalogue',
  templateUrl: './auction-catalogue.component.html',
  styleUrls: ['./auction-catalogue.component.scss']
})
export class AuctionCatalogueComponent implements OnInit, OnDestroy {
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
    const updatedTagIndex = this.trackingTags.findIndex(tag => tag._id === update.documentKey._id);
    if (updatedTagIndex !== -1) {
      // If update includes the full document, replace the existing tag
      if (update.fullDocument) {
        this.trackingTags[updatedTagIndex] = update.fullDocument;
      } else {
        // Otherwise, apply the individual field updates
        const updatedFields = update.updateDescription?.updatedFields || [];
        Object.keys(updatedFields).forEach(field => {
          (this.trackingTags[updatedTagIndex] as any)[field] = updatedFields[field];
        });
      }
    }
  }
}
