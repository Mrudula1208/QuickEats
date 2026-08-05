import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddRestaurant } from './admin-add-restaurant';

describe('AdminAddRestaurant', () => {
  let component: AdminAddRestaurant;
  let fixture: ComponentFixture<AdminAddRestaurant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAddRestaurant],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAddRestaurant);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
