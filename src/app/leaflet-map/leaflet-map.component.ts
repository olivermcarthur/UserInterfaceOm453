import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { TrackerTagService } from '../tracker_tags.service';
import { TrackingTag } from '../tracker_tags';
import { BSON } from 'realm-web';

@Component({
  selector: 'app-leaflet-map',
  templateUrl: './leaflet-map.component.html',
  styleUrls: ['./leaflet-map.component.scss']
})
export class LeafletMapComponent implements OnInit, OnDestroy {
  @ViewChild('map', { static: true }) mapContainer: ElementRef<HTMLDivElement>;
  private map: L.Map;
  private updatesSubscription: Subscription;
  trackingTags: TrackingTag[] = [];
  markers = new Map<string, L.CircleMarker>();

  constructor(private trackingTagService: TrackerTagService) {  }

  async ngOnInit(): Promise<void> {
    console.log('LeafletMapComponent initialising');
    
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

    this.initMap();
    this.plotActiveTrackingTags(); // Plot the active tags on the map

  }

  ngOnDestroy(): void {
    if (this.map) {
      console.log('LeafletMapComponent ngOnDestroy');
      this.map.remove();
    }
    this.updatesSubscription?.unsubscribe();
    console.log('Unsubscribed from collection watcher.');
  }

  private plotActiveTrackingTags(): void {
    this.trackingTags.forEach(tag => {
      if (tag.Active) {
        this.createCircle(tag);
      }
    });
  }

  private createCircle(tag: TrackingTag): void {
    const popupContent = `
    <strong>Name:</strong> ${tag.name || 'N/A'}<br>
    <strong>EPR URL:</strong> ${tag.EPR_URL || 'N/A'}<br>
    <strong>Tag ID:</strong> ${tag.TagID}<br>
    <strong>Time of Update:</strong> ${tag.Time_of_update.toLocaleString()}<br>
  `;

  if (tag.x_location !== undefined && tag.y_location !== undefined) {
    const coordinates = this.convertToMapCoordinates(tag.x_location, tag.y_location);

    // Remove existing marker if it exists
    const existingMarker = this.markers.get(tag._id.toString());
    if (existingMarker) {
      this.map.removeLayer(existingMarker);
      this.markers.delete(tag._id.toString()); // Remove from the markers map as well
    }

    let marker = L.circle(coordinates, {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: 1 // You may need to adjust the radius
    }).addTo(this.map).bindPopup(popupContent);
    this.markers.set(tag._id.toString(), marker);

  } 
  else {
    // This will log if either x_location or y_location is undefined
    console.log(`Tag coordinates are undefined for tag ID: ${tag.TagID}`);
    console.log(`Plot has been abandoned`);
    return
  }
  }
  
  // Conversion method
  private convertToMapCoordinates(x: number, y: number): L.LatLng {
    // Apply the conversion logic
    const lat = -y; // Since y = -y according to your logic
    const lng = x;  // x remains the same
    return new L.LatLng(lat, lng);
  }

  private updateTrackingTag(update: any) {
    if (!update.documentKey?._id) {
      console.error('Update object is missing documentKey or _id:', update);
      return;
    }
    const updatedTagIndex = this.trackingTags.findIndex(tag => {
      // Convert ObjectId to string if necessary
      const localId = tag._id instanceof BSON.ObjectId ? tag._id.toString() : tag._id;
      const updateId = update.documentKey._id instanceof BSON.ObjectId ? update.documentKey._id.toHexString() : update.documentKey._id;
      return localId === updateId;
    });

    if (updatedTagIndex !== -1) {
      // If the update includes the fullDocument, replace the local object entirely
      if (update.fullDocument) {
        this.trackingTags[updatedTagIndex] = update.fullDocument;
        console.log('Change stream activated and full document is replaced with:', this.trackingTags[updatedTagIndex]);
      } 
      else {
        const removedFields = update.updateDescription?.removedFields;
        if (removedFields) {
          // Remove the fields that are not present in updatedFields
          removedFields.forEach((field: string) => {
            delete (this.trackingTags[updatedTagIndex] as any)[field];
          });
          console.log('Removed specified fields:', this.trackingTags[updatedTagIndex]);
        }
      }
    } 
    else {
      console.log('No matching tracking tag found in local data for update:', update);
    }
    this.plotActiveTrackingTags(); // Plot the active tags on the map
  }

  private initMap(): void {
    try {
      console.log('LeafletMapComponent initMap started');
      
      // Create the map
      this.map = L.map(this.mapContainer.nativeElement, {
        minZoom: 1,
        maxZoom: 4,
        center: [0, 0],
        zoom: 1,
        crs: L.CRS.Simple
      });

      // Dimensions of the overlay image and the URL to the image
      const w = 2048;
      const h = 1184;
      const url = './assets/basicfp1.jpg'; // Adjust the path to your image

      // Calculate the image bounds
      const southWest = this.map.unproject([0, h], this.map.getMaxZoom());
      const northEast = this.map.unproject([w, 0], this.map.getMaxZoom());
      const bounds = new L.LatLngBounds(southWest, northEast);

      // Add the image overlay to the map
      L.imageOverlay(url, bounds).addTo(this.map);

      // Fit the map to the image bounds
      this.map.fitBounds(bounds);

      // Add circles to the map
      var circle1 = L.circle([0, 0], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 2 // The radius is in meters
      }).addTo(this.map);
      circle1.bindPopup('I am a circle.');

      var circle2 = L.circle([-74, 128], {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.5,
        radius: 2 // The radius is in meters
      }).addTo(this.map);
      circle2.bindPopup('I am a circle.');

      console.log('LeafletMapComponent map initialized');
    } catch (error) {
      console.error('LeafletMapComponent initMap error:', error);
    }
  }
}
