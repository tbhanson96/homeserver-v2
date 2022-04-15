import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StatusUpdate } from '@api/models';
import { Observable, Subscription } from 'rxjs';

export class ProgressDialogData {
  title: string;
  status: Observable<StatusUpdate>;
}

@Component({
  selector: 'app-progress-dialog',
  templateUrl: './progress-dialog.component.html',
  styleUrls: ['./progress-dialog.component.scss']
})
export class ProgressDialogComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  public progress = -1;
  public mode = 'indeterminate';
  public subText = '';

  constructor(
    private readonly changeDetector: ChangeDetectorRef,
    private readonly dialogRef: MatDialogRef<ProgressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: ProgressDialogData,
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.data.status.subscribe(status => {
        if (status.status === 'Done' || status.status === 'Failed') {
          this.dialogRef.close(status.status);
        }
        if (status.progress < 0) {
          this.mode = 'indeterminate';
        } else {
          this.mode = 'determinate';
        }
        this.progress = status.progress;
        this.subText = status.text; 
        // TODO: figure out why this is necessary and remove it
        this.changeDetector.detectChanges();
      }),
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s?.unsubscribe());
  }
}
