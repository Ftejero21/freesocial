import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Usuario } from 'src/app/Interface/UsuarioRegistro';
import { LoginService } from 'src/app/Service/Login/login.service';

@Component({
  selector: 'app-administrador',
  templateUrl: './administrador.component.html',
  styleUrls: ['./administrador.component.css'],
})
export class AdministradorComponent implements OnInit {

  public usuarios:Usuario[] = [];
  isLoading: boolean = false;
  expandedRow: number | null = null;
  constructor(private loginService:LoginService) { }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  public cargarUsuarios(): void {
    this.loginService.obtenerUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios.content;
        console.log(this.usuarios)
      },
      error: (error) => {
        console.error('Error al obtener los usuarios:', error);
      }
    });
  }

  public cambiarEstado(usuario: Usuario, nuevoEstado: string): void {
    usuario.estado = nuevoEstado
    this.loginService.cambiarEstadoUsuario(usuario.id, nuevoEstado).subscribe({
      next: (response: string) => {
        usuario.estado = nuevoEstado;
      },
      error: (error) => {
        console.error('Error al cambiar el estado:', error);
        this.isLoading = false; // Ocultar el loader incluso si hay un error
      }
    });
  }

  public toggleInfo(index: number): void {
    this.expandedRow = this.expandedRow === index ? null : index;
  }

  public isRowExpanded(index: number): boolean {
    return this.expandedRow === index;
  }

}
