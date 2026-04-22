import { Component, OnInit, ViewChild, AfterViewChecked, AfterViewInit, OnDestroy } from '@angular/core';
import { SettingsService as GeneratedSettingsService } from '@api/services';
import { SettingsDto } from '@api/models/settings-dto';
import { UiStateSelectors } from '@selectors/ui-state.selectors';
import { UiStateActions } from '@actions/ui-state.actions';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTabGroup } from '@angular/material/tabs';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    standalone: false
})
export class SettingsComponent implements OnInit, AfterViewInit, OnDestroy {

  public activeTab = 0;
  private subscriptions: Subscription[] = [];

  private showHiddenFiles: boolean;
  private useDarkMode: boolean;
  @ViewChild('tabBar') tabBar: MatTabGroup;
  @ViewChild('showHiddenFiles') showHiddenFilesCheckbox: MatCheckbox;
  @ViewChild('darkModeSwitch') darkModeSwitch: MatSlideToggle;

  constructor(
    private readonly settingsApi: GeneratedSettingsService,
    private readonly dialogRef: MatDialogRef<SettingsComponent>,
    private readonly uiSelectors: UiStateSelectors,
    private readonly uiActions: UiStateActions,
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.subscriptions.push(this.uiSelectors.getUseDarkMode().subscribe(useDarkMode => {
      this.useDarkMode = useDarkMode;
      this.darkModeSwitch.checked = useDarkMode;
    }));
    this.subscriptions.push(this.uiSelectors.getShowHiddenFiles().subscribe(showHiddenFiles => {
      this.showHiddenFiles = showHiddenFiles; 
      this.showHiddenFilesCheckbox.checked = showHiddenFiles;
    }));
    this.loadSettings();
    this.subscriptions.push(this.tabBar.selectedTabChange.subscribe(value => {
      this.activeTab = value.index;
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onPerformUpdate() {
    const result = this.settingsApi.settingsControllerPerformUpdate();
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
    this.settingsApi.settingsControllerSetSettings({ body: settings }).subscribe({
      complete: () => { },
      error: () => {
        throw new Error(`Failed to save settings: ${settings}`)
      }
    });
    this.dialogRef.close('accept');
    this.uiActions.setDarkMode(this.useDarkMode);
    this.uiActions.setShowHiddenFiles(this.showHiddenFiles);
  }

  onLoadSettingsFile() {
    this.settingsApi.settingsControllerReloadSettings().subscribe({
      next: () => {
        this.loadSettings();
      },
    });
  }

  private loadSettings() {
    this.settingsApi.settingsControllerGetSettings().subscribe({
      next: settings => {
        this.uiActions.setDarkMode(settings.useDarkMode)
        this.uiActions.setShowHiddenFiles(settings.showHiddenFiles);
      }
    });
  }

}
