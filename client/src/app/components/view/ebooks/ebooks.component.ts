import { Component, OnInit } from '@angular/core';
import { UiStateActions } from '@actions/ui-state.actions';
import { EbooksService } from '@services/ebooks.service';
import { EbookData } from '@api/models';

@Component({
  selector: 'app-ebooks',
  templateUrl: './ebooks.component.html',
  styleUrls: ['./ebooks.component.scss']
})
export class EbooksComponent implements OnInit {

  ebooks: EbookData[];
  constructor(private uiActions: UiStateActions, private ebooksService: EbooksService) { }

  ngOnInit() {
    this.uiActions.setAppBusy(true);
    this.uiActions.setCurrentApp('Ebooks');
    this.ebooksService.getEbooks().subscribe(ebooks => {
      this.ebooks = ebooks;
      this.uiActions.setAppBusy(false);
    }, e => {
      this.uiActions.setAppBusy(false);
      throw e;
    });
  }

}
