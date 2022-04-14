import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibgenComponent } from './libgen.component';

describe('LibgenComponent', () => {
  let component: LibgenComponent;
  let fixture: ComponentFixture<LibgenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LibgenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LibgenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
