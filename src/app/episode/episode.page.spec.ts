import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EpisodePage } from './episode.page';

describe('EpisodePage', () => {
  let component: EpisodePage;
  let fixture: ComponentFixture<EpisodePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EpisodePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EpisodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
