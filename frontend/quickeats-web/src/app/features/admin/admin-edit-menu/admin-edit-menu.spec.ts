import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditMenu } from './admin-edit-menu';

describe('AdminEditMenu', () => {
  let component: AdminEditMenu;
  let fixture: ComponentFixture<AdminEditMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEditMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminEditMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
