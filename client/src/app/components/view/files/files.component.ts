import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { Subscription } from 'rxjs';
import { FilesService } from '@services/files.service';
import { FileData } from '@api/models';
import * as validFileTypes from './valid-files';
import { UiStateActions } from '@actions/ui-state.actions';
import { MdcDialog } from '@angular-mdc/web';
import { UploadDialogComponent } from '@components/view/upload-dialog/upload-dialog.component';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {
  files: FileData[] = [];
  reqPath: UrlSegment[];
  showHiddenFiles = false;
  subscriptions: Subscription[];
  constructor(
    private readonly route: ActivatedRoute,
    private readonly dialog: MdcDialog,
    private readonly uiActions: UiStateActions,
    private readonly filesService: FilesService) { }

  ngOnInit() {
    this.uiActions.setCurrentApp('Files');
    this.uiActions.setAppBusy(true);
    this.subscriptions = [
      this.route.url.subscribe(parts => {
        this.reqPath = parts;
        this.updateFiles(this.reqPath);
      }),
    ]
  }

  getRouterLinkFromDir(dir: UrlSegment): string {
    const index = this.reqPath.findIndex(x => x === dir);
    return '/files/' + this.reqPath.slice(0, index + 1).join('/');
  }

  public openUploadDialog() {
    const dialogRef = this.dialog.open(UploadDialogComponent);
  }

  private updateFiles(reqPath: UrlSegment[]) {
    const reqPathString = reqPath.join('/') || '/';
    this.filesService.getDirectory(reqPathString, this.showHiddenFiles).subscribe(data => {
      for (const file of data) {
        if (!validFileTypes[file.type]) {
          file.type = 'file';
        } else {
          file.type = validFileTypes[file.type];
        }
      }
      this.files = data;
      this.uiActions.setAppBusy(false);
    }, err => {
      this.uiActions.setAppBusy(false);
      throw new Error(`Could not get directory: ${reqPathString}`);
    });
  }
}
