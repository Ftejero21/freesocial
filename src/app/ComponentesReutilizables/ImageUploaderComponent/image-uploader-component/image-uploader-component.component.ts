import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-image-uploader-component',
  templateUrl: './image-uploader-component.component.html',
  styleUrls: ['./image-uploader-component.component.css']
})
export class ImageUploaderComponentComponent implements OnInit {
  @Output() imageSelected = new EventEmitter<any>();


  constructor() { }

  ngOnInit(): void {
  }

  handleFileInput(event: any) {
    this.imageSelected.emit(event);
  }

}
