import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideToastr } from 'ngx-toastr';

import { SavedAddressComponent } from './saved-address';

describe('SavedAddressComponent', () => {
  let component: SavedAddressComponent;
  let fixture: ComponentFixture<SavedAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedAddressComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideToastr()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SavedAddressComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

