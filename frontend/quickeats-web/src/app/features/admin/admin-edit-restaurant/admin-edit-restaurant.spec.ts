import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditRestaurant } from './admin-edit-restaurant';

describe('AdminEditRestaurant', () => {
  let component: AdminEditRestaurant;
  let fixture: ComponentFixture<AdminEditRestaurant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEditRestaurant],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminEditRestaurant);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
