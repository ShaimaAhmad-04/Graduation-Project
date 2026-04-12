import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternshipDetail } from './internship-detail';

describe('InternshipDetail', () => {
  let component: InternshipDetail;
  let fixture: ComponentFixture<InternshipDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternshipDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InternshipDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
