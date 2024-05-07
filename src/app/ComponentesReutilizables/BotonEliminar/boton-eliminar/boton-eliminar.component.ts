import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-boton-eliminar',
  templateUrl: './boton-eliminar.component.html',
  styleUrls: ['./boton-eliminar.component.css']
})
export class BotonEliminarComponent implements OnInit {

  @Output() eliminar = new EventEmitter<string>();


  constructor() { }

  ngOnInit(): void {
  }

  public onClick(): void {
    this.eliminar.emit(); 
  }

}
