import { TestBed } from '@angular/core/testing';

import { LeadTypeService } from './lead-type.service';

describe('LeadTypeService', () => {
  let service: LeadTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeadTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
