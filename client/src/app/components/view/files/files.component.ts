import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FilesService } from '@services/files.service';
import { FileData } from '@api/models';
import * as validFileTypes from './valid-files';
import { UiStateActions } from '@actions/ui-state.actions';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {
  files: FileData[] = [];
  subscriptions: Subscription[];
  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly uiActions: UiStateActions,
    private readonly filesService: FilesService) { }

  ngOnInit() {
    this.uiActions.setAppBusy(true); 
    this.subscriptions = [
      this.route.url.subscribe(parts => {
        const reqPath = parts.join('/') || '/';
        if (!this.isFileRequest(reqPath)) {
          this.filesService.getDirectory(reqPath).subscribe(data => {
            for(let file of data) {
              if (!validFileTypes[file.type]) {
                file.type = 'file';
              }
            }
            this.files = data;
            this.uiActions.setAppBusy(false);
          });
        }
      }),
    ]
  }

  private isFileRequest(reqPath: string): boolean {
    if (validFileTypes[reqPath.split('.').slice(-1)[0]]) {
      return true;
    } else return false;
  }
}
