import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformLoginComponent } from './perform-login.component';

describe('PerformLoginComponent', () => {
  let component: PerformLoginComponent;
  let fixture: ComponentFixture<PerformLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerformLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
