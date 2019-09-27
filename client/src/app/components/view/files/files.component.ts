import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {
  files = [];
  subscriptions: Subscription[];
  constructor(private readonly route: ActivatedRoute) { }

  ngOnInit() {
    this.subscriptions = [
      this.route.url.subscribe(parts => {
      }),
    ]
  }

}
