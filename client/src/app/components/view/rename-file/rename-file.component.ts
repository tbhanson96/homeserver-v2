import { Component, OnInit, Input, Inject } from '@angular/core';
import { FileData } from '@api/models';
import { MDC_DIALOG_DATA } from '@angular-mdc/web';
import { of, Observable } from 'rxjs';

@Component({
  selector: 'app-rename-file',
  templateUrl: './rename-file.component.html',
  styleUrls: ['./rename-file.component.scss']
})
export class RenameFileComponent implements OnInit {

  public newFileName: string;

  constructor(
    @Inject(MDC_DIALOG_DATA) public data: { selectedFile: FileData},
  ) { }

  ngOnInit() {
    this.newFileName = this.data.selectedFile.name;
  }

  public onRenameFile(): Observable<void> {
    console.log('rename file called with arg:' + this.newFileName);
    return new Observable(subscriber => {
      setTimeout(() => {
        subscriber.complete();
      }, 2000);
    })
  }

}
