import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadTypesComponent } from './lead-types.component';

describe('LeadTypesComponent', () => {
  let component: LeadTypesComponent;
  let fixture: ComponentFixture<LeadTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadTypesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LeadTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
