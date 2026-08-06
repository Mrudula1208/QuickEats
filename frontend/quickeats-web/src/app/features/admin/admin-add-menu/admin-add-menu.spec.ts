import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddMenu } from './admin-add-menu';

describe('AdminAddMenu', () => {
  let component: AdminAddMenu;
  let fixture: ComponentFixture<AdminAddMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAddMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAddMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
