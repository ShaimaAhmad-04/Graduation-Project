import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternshipCard } from './internship-card';

describe('InternshipCard', () => {
  let component: InternshipCard;
  let fixture: ComponentFixture<InternshipCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternshipCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InternshipCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
