import { Component, OnInit } from '@angular/core';
import { FilesService } from 'app/services/files.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'homeserver-v2-frontend';

  constructor(private filesService: FilesService) {
  }

  public ngOnInit(): void {
    this.filesService.setCurrentDirectory('default');
  }
}
