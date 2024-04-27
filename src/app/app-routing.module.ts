import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrackerTagComponent } from './tracking-tags/tracking-tags.component'; // Update the path as necessary

const routes: Routes = [
  { path: '', component: TrackerTagComponent },
  // ... other route definitions ...
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
