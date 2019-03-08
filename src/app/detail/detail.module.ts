import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule, ActivatedRoute } from '@angular/router';
import { RestApiService } from '../rest-api.service';

import { IonicModule } from '@ionic/angular';

import { DetailPage } from './detail.page';
import { Movie } from 'src/models/movies';
import { Serie } from 'src/models/series';

const routes: Routes = [
  {
    path: '',
    component: DetailPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [DetailPage]
})

export class DetailPageModule {
}
