import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedRestaurantsComponent } from '../featured-restaurants';

describe('FeaturedRestaurantsComponent', () => {

  let component: FeaturedRestaurantsComponent;
  let fixture: ComponentFixture<FeaturedRestaurantsComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({

      imports: [FeaturedRestaurantsComponent]

    }).compileComponents();

    fixture = TestBed.createComponent(FeaturedRestaurantsComponent);

    component = fixture.componentInstance;

    await fixture.whenStable();

  });

  it('should create', () => {

    expect(component).toBeTruthy();

  });

});