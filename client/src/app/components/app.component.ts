import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { UiStateSelectors } from '@selectors/ui-state.selectors';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly uiSelectors: UiStateSelectors,
  ) { }

  ngOnInit() {
    this.uiSelectors.getUseDarkMode().subscribe(useDarkMode => {
      if (useDarkMode) {
        this.document.getElementById('theme').setAttribute('href', 'dark.css');
      } else {
        this.document.getElementById('theme').setAttribute('href', 'light.css');
      }
    })
  }

}