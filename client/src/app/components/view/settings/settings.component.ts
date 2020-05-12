import { Component, OnInit, AfterViewInit, HostBinding, ViewChild } from '@angular/core';
import { ApiService } from '@api/services';
import { MdcDialogRef, MdcCheckbox } from '@angular-mdc/web';
import { SettingsDto } from '@api/models/settings-dto';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  public updatesAvailable: string[];
  private selectedUpdate: string = null;
  private showHiddenFiles: boolean;
  @ViewChild('showHiddenFiles', { static: false }) showHiddenFilesCheckbox: MdcCheckbox;

  constructor(
    private readonly api: ApiService,
    private dialogRef: MdcDialogRef<SettingsComponent>,
  ) { }

  ngOnInit() {
    this.api.getApiSettingsUpdate().subscribe(updates => {
      this.updatesAvailable = updates;
    });
    this.api.getApiSettings().subscribe(settings => {
      this.showHiddenFiles = settings.showHiddenFiles; 
      this.showHiddenFilesCheckbox.checked = this.showHiddenFiles;
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

  onSettingsSave() {
    const settings: SettingsDto = {
      showHiddenFiles: this.showHiddenFiles,
    };
    this.api.postApiSettings(settings).subscribe(() => { }, () => {
      throw new Error(`Failed to save settings: ${settings}`)
    });
    this.dialogRef.close('accept');
  }

}
