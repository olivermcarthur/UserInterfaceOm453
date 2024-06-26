import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-leaflet-map',
  template: '<div #map style="width: 100%; height: 400px;"></div>',
  styleUrls: []
})
export class LeafletMapComponent implements OnInit, OnDestroy {
  @ViewChild('map') mapContainer: ElementRef;
  map: L.Map;

  ngOnInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.map.remove();
  }

  private initMap(): void {
    // Create the map
    this.map = L.map(this.mapContainer.nativeElement, {
      minZoom: 1,
      maxZoom: 4,
      center: [0, 0],
      zoom: 1,
      crs: L.CRS.Simple // Use a simple coordinate reference system
    });

    // Assuming your floorplan is 2048x1184 pixels
    const w = 2048,
          h = 1184,
          url = './assets/basicfp1.jpg'; // URL to your floorplan image

    // Calculate the edges of the image, in coordinates
    const southWest = this.map.unproject([0, h], this.map.getMaxZoom());
    const northEast = this.map.unproject([w, 0], this.map.getMaxZoom());
    const bounds = new L.LatLngBounds(southWest, northEast);

    // Add the image overlay to the map
    L.imageOverlay(url, bounds).addTo(this.map);

    // Fit the map to the image bounds
    this.map.fitBounds(bounds);
  }
}
