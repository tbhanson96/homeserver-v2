import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
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
  reqPath: UrlSegment[];
  subscriptions: Subscription[];
  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly uiActions: UiStateActions,
    private readonly filesService: FilesService) { }

  ngOnInit() {
    this.uiActions.setCurrentApp('Files');
    this.uiActions.setAppBusy(true); 
    this.subscriptions = [
      this.route.url.subscribe(parts => {
        this.reqPath = parts;
        const reqPathString = parts.join('/') || '/';
        if (!this.isFileRequest(reqPathString)) {
          this.filesService.getDirectory(reqPathString).subscribe(data => {
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

  private getRouterLinkFromDir(dir: UrlSegment): string {
    let index = this.reqPath.findIndex(x => x === dir);
    return '/files/' + this.reqPath.slice(0, index+1).join('/');
  }
}
