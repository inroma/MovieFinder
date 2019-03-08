import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FavorisPage } from './favoris.page';

describe('FavorisPage', () => {
  let component: FavorisPage;
  let fixture: ComponentFixture<FavorisPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FavorisPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FavorisPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
