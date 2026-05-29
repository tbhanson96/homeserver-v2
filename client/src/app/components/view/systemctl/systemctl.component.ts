import { UiStateActions } from '@actions/ui-state.actions';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SystemctlService, SystemctlUnit } from '@services/systemctl.service';

@Component({
    selector: 'app-systemctl',
    templateUrl: './systemctl.component.html',
    styleUrls: ['./systemctl.component.scss'],
    standalone: false
})
export class SystemctlComponent implements OnInit {

  public units: SystemctlUnit[] = [];
  public displayedColumns = ['name', 'active', 'sub', 'description', 'actions'];
  public restartingUnit?: string;

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

  public restartUnit(unit: SystemctlUnit): void {
    this.restartingUnit = unit.name;
    this.uiActions.setAppBusy(true);
    this.systemctlService.restartUnit(unit.name).subscribe({
      next: () => {
        this.snackbar.open(`Restarted ${unit.name}`, 'Close');
        this.restartingUnit = undefined;
        this.loadUnits();
      },
      error: err => {
        this.restartingUnit = undefined;
        this.uiActions.setAppBusy(false);
        throw err;
      },
    });
  }
}
