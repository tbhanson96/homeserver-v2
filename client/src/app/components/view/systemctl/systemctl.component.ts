import { UiStateActions } from '@actions/ui-state.actions';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SystemctlService, SystemctlUnit, SystemctlUnitAction } from '@services/systemctl.service';

@Component({
    selector: 'app-systemctl',
    templateUrl: './systemctl.component.html',
    styleUrls: ['./systemctl.component.scss'],
    standalone: false
})
export class SystemctlComponent implements OnInit {

  public units: SystemctlUnit[] = [];
  public displayedColumns = ['name', 'active', 'sub', 'description', 'actions'];
  public runningAction?: { unit: string; action: SystemctlUnitAction };

  constructor(
    private readonly systemctlService: SystemctlService,
    private readonly uiActions: UiStateActions,
    private readonly snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.uiActions.setCurrentApp('Services');
    this.loadUnits();
  }

  public loadUnits(): void {
    this.uiActions.setAppBusy(true);
    this.systemctlService.listUnits().subscribe({
      next: units => {
        this.units = units;
        this.uiActions.setAppBusy(false);
      },
      error: err => {
        this.uiActions.setAppBusy(false);
        throw err;
      },
    });
  }

  public startUnit(unit: SystemctlUnit): void {
    this.runUnitAction(unit, 'start');
  }

  public stopUnit(unit: SystemctlUnit): void {
    this.runUnitAction(unit, 'stop');
  }

  public restartUnit(unit: SystemctlUnit): void {
    this.runUnitAction(unit, 'restart');
  }

  public isRunningAction(unit: SystemctlUnit, action: SystemctlUnitAction): boolean {
    return this.runningAction?.unit === unit.name && this.runningAction.action === action;
  }

  public isRunningAnyAction(unit: SystemctlUnit): boolean {
    return this.runningAction?.unit === unit.name;
  }

  private runUnitAction(unit: SystemctlUnit, action: SystemctlUnitAction): void {
    this.runningAction = { unit: unit.name, action };
    this.uiActions.setAppBusy(true);
    this.getUnitActionRequest(unit.name, action).subscribe({
      next: () => {
        this.snackbar.open(this.actionPastTense(action) + ' ' + unit.name, 'Close');
        this.runningAction = undefined;
        this.loadUnits();
      },
      error: err => {
        this.runningAction = undefined;
        this.uiActions.setAppBusy(false);
        throw err;
      },
    });
  }

  private getUnitActionRequest(unitName: string, action: SystemctlUnitAction) {
    switch (action) {
      case 'start':
        return this.systemctlService.startUnit(unitName);
      case 'stop':
        return this.systemctlService.stopUnit(unitName);
      case 'restart':
        return this.systemctlService.restartUnit(unitName);
    }
  }

  private actionPastTense(action: SystemctlUnitAction): string {
    switch (action) {
      case 'start':
        return 'Started';
      case 'stop':
        return 'Stopped';
      case 'restart':
        return 'Restarted';
    }
  }
}
