import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { recruiterGuard } from './recruiter-guard';

describe('recruiterGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => recruiterGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
