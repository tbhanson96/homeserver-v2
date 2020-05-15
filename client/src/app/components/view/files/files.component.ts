import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { FilesService } from '@services/files.service';
import { FileData } from '@api/models';
import * as validFileTypes from './valid-files';
import { UiStateActions } from '@actions/ui-state.actions';
import { MdcDialog, MdcMenu, MdcSnackbar } from '@angular-mdc/web';
import { UploadDialogComponent } from '@components/view/upload-dialog/upload-dialog.component';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { UploadType } from '../upload-dialog/upload-type';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit, OnDestroy {
  readonly defaultMaxFilesShown = 20;
  readonly showMoreIncrement = 20;
  files: FileData[] = [];
  reqPath: string[];
  showHiddenFiles = false;
  maxFilesShown = this.defaultMaxFilesShown;
  subscriptions: Subscription[];

  public get visibleFiles() {
    return this.files.slice(0, this.maxFilesShown);
  }
  constructor(
    private readonly route: ActivatedRoute,
    private readonly snackbar: MdcSnackbar,
    private readonly dialog: MdcDialog,
    private readonly uiActions: UiStateActions,
    private readonly filesService: FilesService) { }

  ngOnInit() {
    this.uiActions.setCurrentApp('Files');
    this.subscriptions = [
      this.route.url.subscribe(parts => {
        this.uiActions.setAppBusy(true);
        this.reqPath = parts.map(p => decodeURI(p.toString()));
        this.updateFiles();
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
    const dialogRef = this.dialog.open(UploadDialogComponent, { data: UploadType.Files });
    dialogRef.afterClosed().subscribe(result => {
      if (result instanceof Observable) {
        this.uiActions.setAppBusy(true);
        result.subscribe(() => {
          this.updateFiles();
        }, () => {
          this.uiActions.setAppBusy(false);
        });
      }
    });
  }

  public onShowMoreFiles() {
    this.maxFilesShown += this.showMoreIncrement;
  }

  public onShowFileOptions(event: Event, menu: MdcMenu) {
    event.preventDefault();
    event.stopPropagation();
    menu.open = !menu.open;
  }

  public onDeleteFile(event: Event, file: FileData) {
    event.preventDefault();
    event.stopPropagation();
    const dialogRef = this.dialog.open(DeleteDialogComponent, { data: { service: UploadType.Files, file }});
    dialogRef.afterClosed().subscribe(result => {
      if (result instanceof Observable) {
        this.uiActions.setAppBusy(true);
        result.subscribe(() => {
          this.snackbar.open(`Successfully deleted file: ${file.name}`);
          this.updateFiles();
        }, () => {
          this.uiActions.setAppBusy(false);
          throw new Error(`Failed to delete file: ${file.name}`);
        });
      }
    });
  }

  private updateFiles() {
    this.maxFilesShown = this.defaultMaxFilesShown;
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
