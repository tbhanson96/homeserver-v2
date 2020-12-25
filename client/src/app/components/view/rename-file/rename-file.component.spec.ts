import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RenameFileComponent } from './rename-file.component';

describe('RenameFileComponent', () => {
  let component: RenameFileComponent;
  let fixture: ComponentFixture<RenameFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RenameFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenameFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
