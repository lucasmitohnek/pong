import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Vscom } from './vscom';

describe('Vscom', () => {
  let component: Vscom;
  let fixture: ComponentFixture<Vscom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Vscom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Vscom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
