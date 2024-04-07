import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  template: `
    <div class="content-wrapper">
      <app-leaflet-map></app-leaflet-map>
      <router-outlet></router-outlet>
    </div>
  `,
})
export class AppComponent { }
