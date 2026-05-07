import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Squash } from './squash';

describe('Squash', () => {
  let component: Squash;
  let fixture: ComponentFixture<Squash>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Squash]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Squash);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
