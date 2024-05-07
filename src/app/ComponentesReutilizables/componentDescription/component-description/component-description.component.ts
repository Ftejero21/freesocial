import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-component-description',
  templateUrl: './component-description.component.html',
  styleUrls: ['./component-description.component.css']
})
export class ComponentDescriptionComponent implements OnInit {

  @Input() textoCompleto: string = '';
  public isTruncated = true;
  public wordLimit = 200;

  constructor(private sanitizer:DomSanitizer) { }

  ngOnInit(): void {
  }

  public get displayedText(): SafeHtml  {
    let textToShow = this.textoCompleto;
    if (!textToShow) return this.sanitizer.bypassSecurityTrustHtml('');
    const textoEsLargo = textToShow.length > this.wordLimit;

    if (textoEsLargo && this.isTruncated) {
      textToShow = textToShow.substring(0, this.wordLimit) + '...';
    }

    // Transforma los saltos de línea en <br> para mostrarlos correctamente en HTML
    return this.sanitizer.bypassSecurityTrustHtml(textToShow.replace(/\n/g, '<br>'));
  }

  public toggleText() {
    this.isTruncated = !this.isTruncated;
  }

}
