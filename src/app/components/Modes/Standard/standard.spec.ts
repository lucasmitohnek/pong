import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Standard } from './standard';

describe('Standard', () => {
  let component: Standard;
  let fixture: ComponentFixture<Standard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Standard],
    }).compileComponents();

    fixture = TestBed.createComponent(Standard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
