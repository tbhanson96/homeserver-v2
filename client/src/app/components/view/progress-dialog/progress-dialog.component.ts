import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';

export class ProgressDialogData {
  title: string;
  progress: Observable<number>;
  subText?: Observable<string>;
}

@Component({
  selector: 'app-progress-dialog',
  templateUrl: './progress-dialog.component.html',
  styleUrls: ['./progress-dialog.component.scss']
})
export class ProgressDialogComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  progress = -1;
  mode = 'indeterminate';
  subText = '';

  constructor(
    private readonly dialogRef: MatDialogRef<ProgressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: ProgressDialogData
  ) { }


  ngOnInit(): void {
    this.subscriptions.push(
      this.data.progress.subscribe(p => {
        if (p < 0) {
          this.mode = 'indeterminate';
        } else {
          this.mode = 'determinate';
        }
        this.progress = p;
      }),
      this.data.subText?.subscribe(text => {
        this.subText = text; 
      }),
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s?.unsubscribe());
  }

}
