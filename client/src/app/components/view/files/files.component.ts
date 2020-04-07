import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class FilesComponent implements OnInit, OnDestroy {
  files: FileData[] = [];
  reqPath: string[];
  showHiddenFiles = false;
  subscriptions: Subscription[];
  constructor(
    private readonly route: ActivatedRoute,
    private readonly dialog: MdcDialog,
    private readonly uiActions: UiStateActions,
    private readonly filesService: FilesService) { }

  ngOnInit() {
    this.uiActions.setCurrentApp('Files');
    this.subscriptions = [
      this.route.url.subscribe(parts => {
        this.uiActions.setAppBusy(true);
        this.reqPath = parts.map(p => decodeURI(p.toString()));
        this.updateFiles(this.reqPath);
        this.uiActions.setCurrentFilesDirectory(this.joinReqPath(this.reqPath));
      }),
    ]
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  getRouterLinkFromDir(dir: string): string {
    const index = this.reqPath.findIndex(x => x === dir);
    return '/home/files/' + this.reqPath.slice(0, index + 1).join('/');
  }

  public openUploadDialog() {
    const dialogRef = this.dialog.open(UploadDialogComponent);
  }

  private updateFiles(reqPath: string[]) {
    const reqPathString = this.joinReqPath(this.reqPath);
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

  private joinReqPath(reqPath: string[]): string {
    return reqPath.join('/') || '/';
  }
}
