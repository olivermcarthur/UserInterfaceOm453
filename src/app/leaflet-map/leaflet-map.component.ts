// leaflet-map.component.ts

import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-leaflet-map',
  templateUrl: './leaflet-map.component.html',
  styleUrls: ['./leaflet-map.component.scss']
})
export class LeafletMapComponent implements OnInit, OnDestroy {
  @ViewChild('map', { static: true }) mapContainer: ElementRef<HTMLDivElement>;
  private map: L.Map;

  ngOnInit(): void {
    console.log('LeafletMapComponent ngOnInit');
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      console.log('LeafletMapComponent ngOnDestroy');
      this.map.remove();
    }
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

      console.log('LeafletMapComponent map initialized');
    } catch (error) {
      console.error('LeafletMapComponent initMap error:', error);
    }
  }
}
