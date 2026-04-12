import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternshipList } from './internship-list';

describe('InternshipList', () => {
  let component: InternshipList;
  let fixture: ComponentFixture<InternshipList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternshipList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InternshipList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
