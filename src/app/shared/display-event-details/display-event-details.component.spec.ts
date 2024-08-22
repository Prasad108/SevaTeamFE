import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DisplayEventDetailsComponent } from './display-event-details.component';

describe('DisplayEventDetailsComponent', () => {
  let component: DisplayEventDetailsComponent;
  let fixture: ComponentFixture<DisplayEventDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DisplayEventDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DisplayEventDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
