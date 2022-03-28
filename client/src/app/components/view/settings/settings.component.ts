import { Component, OnInit, ViewChild, AfterViewChecked, AfterViewInit, OnDestroy } from '@angular/core';
import { ApiService } from '@api/services';
import { SettingsDto } from '@api/models/settings-dto';
import { UiStateSelectors } from '@selectors/ui-state.selectors';
import { UiStateActions } from '@actions/ui-state.actions';
import { take } from 'rxjs/operators';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTabGroup } from '@angular/material/tabs';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, AfterViewInit, OnDestroy {

  public updatesAvailable: string[];
  public activeTab = 0;
  private subscriptions: Subscription[] = [];

  private selectedUpdate: string = null;
  private showHiddenFiles: boolean;
  private useDarkMode: boolean;
  @ViewChild('tabBar') tabBar: MatTabGroup;
  @ViewChild('showHiddenFiles') showHiddenFilesCheckbox: MatCheckbox;
  @ViewChild('darkModeSwitch') darkModeSwitch: MatSlideToggle;

  constructor(
    private readonly api: ApiService,
    private readonly dialogRef: MatDialogRef<SettingsComponent>,
    private readonly uiSelectors: UiStateSelectors,
    private readonly uiActions: UiStateActions,
  ) { }

  ngOnInit() {
    this.api.settingsControllerGetPath().subscribe(updates => {
      this.updatesAvailable = updates;
    });
  }

  ngAfterViewInit() {
    this.api.settingsControllerGetSettings().subscribe(settings => {
      this.showHiddenFiles = settings.showHiddenFiles; 
      this.showHiddenFilesCheckbox.checked = this.showHiddenFiles;
    });
    this.uiSelectors.getUseDarkMode().pipe(take(1)).subscribe(useDarkMode => {
      this.useDarkMode = useDarkMode;
      this.darkModeSwitch.checked = useDarkMode;
    });
    this.subscriptions.push(this.tabBar.selectedTabChange.subscribe(value => {
      this.activeTab = value.index;
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onSelectUpdate(update: string) {
    this.selectedUpdate = update;
  }

  onPerformUpdate() {
    const result = this.api.settingsControllerPerformUpdate({ update: this.selectedUpdate });
    this.dialogRef.close(result);
  }

  onShowHiddenFilesToggle(show: boolean) {
    this.showHiddenFiles = show;
  }

  onUseDarkModeToggle(useDarkMode: boolean) {
    this.useDarkMode = useDarkMode;
  }

  onSettingsSave() {
    const settings: SettingsDto = {
      showHiddenFiles: this.showHiddenFiles,
      useDarkMode: this.useDarkMode,
    };
    this.api.settingsControllerSetSettings({ body: settings }).subscribe({
      complete: () => { },
      error: () => {
        throw new Error(`Failed to save settings: ${settings}`)
      }
    });
    this.dialogRef.close('accept');
    this.uiActions.setDarkMode(this.useDarkMode);
  }

}
