import { Component, OnInit, ViewChild, AfterViewChecked, AfterViewInit } from '@angular/core';
import { ApiService } from '@api/services';
import { MdcDialogRef, MdcCheckbox, MdcSwitch } from '@angular-mdc/web';
import { SettingsDto } from '@api/models/settings-dto';
import { UiStateSelectors } from '@selectors/ui-state.selectors';
import { UiStateActions } from '@actions/ui-state.actions';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, AfterViewInit {


  public updatesAvailable: string[];
  private selectedUpdate: string = null;
  private showHiddenFiles: boolean;
  private useDarkMode: boolean;
  @ViewChild('showHiddenFiles', { static: false }) showHiddenFilesCheckbox: MdcCheckbox;
  @ViewChild('darkModeSwitch', { static: false }) darkModeSwitch: MdcSwitch;

  constructor(
    private readonly api: ApiService,
    private dialogRef: MdcDialogRef<SettingsComponent>,
    private readonly uiSelectors: UiStateSelectors,
    private readonly uiActions: UiStateActions,
  ) { }

  ngOnInit() {
    this.api.getApiSettingsUpdate().subscribe(updates => {
      this.updatesAvailable = updates;
    });
  }

  ngAfterViewInit() {
    this.api.getApiSettings().subscribe(settings => {
      this.showHiddenFiles = settings.showHiddenFiles; 
      this.showHiddenFilesCheckbox.checked = this.showHiddenFiles;
    });
    this.uiSelectors.getUseDarkMode().pipe(take(1)).subscribe(useDarkMode => {
      this.useDarkMode = useDarkMode;
      this.darkModeSwitch.checked = useDarkMode;
    });
  }

  onSelectUpdate(update: string) {
    this.selectedUpdate = update;
  }

  onPerformUpdate() {
    const result = this.api.postApiSettingsUpdate(this.selectedUpdate);
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
    this.api.postApiSettings(settings).subscribe(() => { }, () => {
      throw new Error(`Failed to save settings: ${settings}`)
    });
    this.dialogRef.close('accept');
    this.uiActions.setDarkMode(this.useDarkMode);
  }

}
