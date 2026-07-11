import { TestBed } from '@angular/core/testing';

import { CustomerLeadService } from './customer-lead.service';

describe('CustomerLeadService', () => {
  let service: CustomerLeadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerLeadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
