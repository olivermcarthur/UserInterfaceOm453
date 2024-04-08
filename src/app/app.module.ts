import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgOptimizedImage, provideImgixLoader } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RealmAppService } from './realm-app.service';
import { initializeApp } from './app-initializer';
import { TrackerTagComponent } from './tracking-tags/tracking-tags.component';
import { TrackerTagService } from './tracker_tags.service';
import { LeafletMapComponent } from './leaflet-map/leaflet-map.component'; // Adjust the path as necessary
// import {TitleComponent} from './title-component/title-component.component';

@NgModule({
  declarations: [
    AppComponent,
    // TitleComponent,
    TrackerTagComponent, // Ensure this is included
    LeafletMapComponent
  ],
  // If you're using TrackerTagComponent in other modules, add it to exports:
  // exports: [TrackerTagComponent],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    NgOptimizedImage,
  ],
  providers: [
    provideImgixLoader("https://bidding-system.imgix.net/"),
    TrackerTagService, // Ensure your service is provided here or in the component
    {
      provide: APP_INITIALIZER,
      deps: [RealmAppService],
      useFactory: initializeApp,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
