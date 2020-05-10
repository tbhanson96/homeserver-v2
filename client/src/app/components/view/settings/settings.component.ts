import { Component, OnInit } from '@angular/core';
import { ApiService } from '@api/services';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  public updatesAvailable: string[] = ["update1.tar.gz", "update2.tar.gz"];
  private selectedUpdate: string = null;
  constructor(
    private readonly api: ApiService,
  ) { }

  ngOnInit() {
    // this.api.checkForUpdates().subscribe(updates => {
    //   this.updatesAvailable = updates;
    // });
  }

  onSelectUpdate(update: string) {
    this.selectedUpdate = update;
  }

}
