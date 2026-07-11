import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesDrawerComponent } from './notes-drawer.component';

describe('NotesDrawerComponent', () => {
  let component: NotesDrawerComponent;
  let fixture: ComponentFixture<NotesDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotesDrawerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotesDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
