import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FilesService } from '@services/files.service';
import { FileData } from '@api/models';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {
  files: FileData[] = [];
  subscriptions: Subscription[];
  constructor(
    private readonly route: ActivatedRoute,
    private readonly filesService: FilesService) { }

  ngOnInit() {
    this.subscriptions = [
      this.route.url.subscribe(parts => {
        const reqPath = parts.join('/') || '/';
        this.filesService.getDirectory(reqPath).subscribe(data => {
          this.files = data;
        })
      }),
    ]
  }

}
