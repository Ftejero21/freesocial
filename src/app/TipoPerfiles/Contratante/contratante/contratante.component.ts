import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-contratante',
  templateUrl: './contratante.component.html',
  styleUrls: ['./contratante.component.css']
})
export class ContratanteComponent implements OnInit {
  @Input() userId!: number;
  constructor() { }

  ngOnInit(): void {
  }

}
