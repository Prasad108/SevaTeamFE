import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VolunteerRegistrationPage } from './volunteer-registration.page';

describe('VolunteerRegistrationPage', () => {
  let component: VolunteerRegistrationPage;
  let fixture: ComponentFixture<VolunteerRegistrationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VolunteerRegistrationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
