// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="content-wrapper">
      <h1 class="page-title">In-Hospital Patient Tracking System</h1>
      <app-leaflet-map></app-leaflet-map>
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./app.component.scss'] // Make sure to reference the correct CSS file
})
export class AppComponent {
  constructor() {
    console.log('AppComponent constructed');
  }

  ngOnInit() {
    console.log('AppComponent initialized');
  }
}
