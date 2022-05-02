import { Component, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-lazy-img',
  templateUrl: './lazy-img.component.html',
  styleUrls: ['./lazy-img.component.scss']
})
export class LazyImgComponent implements OnInit {

  @Input() src = '';

  @ViewChild('image')
  public image: any;

  public isLoading = true;
  constructor() { }

  ngOnInit(): void {
      var img = new Image();
      var imgUrl = this.src;
      img.onload = () => {
          // this gets run once the image has finished downloading
          this.isLoading = false;
          this.image.nativeElement.src = imgUrl;
      }
      img.src = imgUrl; // this causes the image to get downloaded in the background
  }
}
