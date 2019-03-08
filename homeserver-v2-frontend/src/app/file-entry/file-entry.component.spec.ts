import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileEntryComponent } from './file-entry.component';

describe('FileEntryComponent', () => {
  let component: FileEntryComponent;
  let fixture: ComponentFixture<FileEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
