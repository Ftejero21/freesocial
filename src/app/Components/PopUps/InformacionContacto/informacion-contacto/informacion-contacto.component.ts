import { Component, Input, OnInit } from '@angular/core';
import { Usuario } from 'src/app/Interface/UsuarioRegistro';

@Component({
  selector: 'app-informacion-contacto',
  templateUrl: './informacion-contacto.component.html',
  styleUrls: ['./informacion-contacto.component.css']
})
export class InformacionContactoComponent implements OnInit {
  @Input() usuario!: Usuario;
  public cumpleanos!: string;
  constructor() { }

  ngOnInit(): void {
    console.log("usuario:", this.usuario)
    this.obtenerUsuario();
  }

  private obtenerUsuario() {
    // Suponiendo que obtienes los datos del usuario así
    // ...
    this.formatoCumpleaños(this.usuario.datosPersonales.fechaNacimiento);
  }

  private formatoCumpleaños(fechaNacimiento: string) {
    const fecha = new Date(fechaNacimiento);
    const dia = fecha.getDate();
    const mes = fecha.toLocaleString('default', { month: 'long' });
    this.cumpleanos = `${dia} de ${mes}`;
  }

}
