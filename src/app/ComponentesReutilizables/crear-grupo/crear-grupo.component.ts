import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { ChatGrupal } from 'src/app/Interface/ChatGrupal';
import { ChatGrupalCreacion } from 'src/app/Interface/ChatGrupalCreacion';
import { Usuario } from 'src/app/Interface/UsuarioRegistro';
import { LoginService } from 'src/app/Service/Login/login.service';
import { MensajeriaService } from 'src/app/Service/mensajeria/mensajeria.service';


@Component({
  selector: 'app-crear-grupo',
  templateUrl: './crear-grupo.component.html',
  styleUrls: ['./crear-grupo.component.css']
})
export class CrearGrupoComponent implements OnInit {
  imagenGrupo: string | null = null;
  nombreChat: string = '';
  usuarios: any[] = [];
  imagenGrupoVistaPrevia: string | null = null;
  usuariosSeleccionados: number[] = [];

  constructor(private usuarioService: LoginService,private mensajeriaService:MensajeriaService) {}

  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  public obtenerUsuarios(): void {
    this.usuarioService.obtenerUsuariosQueSigo().subscribe(
      (response: any) => {
        // Si la respuesta es un array
        if (Array.isArray(response)) {
          this.usuarios = response.map((usuario: any) => ({
            id: usuario.id,
            nombreCompleto: `${usuario.datosPersonales?.nombre || ''} ${usuario.datosPersonales?.apellidos || ''}`.trim(),
            imagenPerfil: usuario.imagenPerfil ? `data:image/jpeg;base64,${usuario.imagenPerfil}` : 'assets/usuario.png'
          }));
        } else {
          console.error('Formato inesperado en la respuesta:', response);
          this.usuarios = [];
        }
      },
      (error: any) => {
        console.error('Error al obtener usuarios:', error);
      }
    );
  }




  onSeleccionUsuario(usuario: any): void {
    const index = this.usuariosSeleccionados.indexOf(usuario.id);
    if (index === -1) {
      this.usuariosSeleccionados.push(usuario.id);
    } else {
      this.usuariosSeleccionados.splice(index, 1);
    }
  }

  onImagenSeleccionada(event: any): void {
    const archivo = (event.target as HTMLInputElement).files?.[0];
    if (archivo) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Vista previa (si necesitas mostrarla en el modal)
        this.imagenGrupoVistaPrevia = e.target.result;

        // Extraer el contenido base64
        const imagenGrupoBase64 = e.target.result.split(',')[1];
        if (imagenGrupoBase64) {
          this.imagenGrupo = imagenGrupoBase64;
        } else {
          console.error('Error al procesar la imagen en base64.');
        }
      };
      reader.readAsDataURL(archivo);
    }
  }


  crearGrupo(): void {
    if (!this.nombreChat.trim() || this.usuariosSeleccionados.length === 0) {
      alert('Debe ingresar un título y seleccionar al menos un usuario.');
      return;
    }

    // Construir el objeto para la creación del chat grupal
    const nuevoChatGrupal: ChatGrupalCreacion = {
      nombreChat: this.nombreChat,
      imagenGrupoBase64: this.imagenGrupo ?? '', // Imagen en base64 o vacío
      usuarios: this.usuariosSeleccionados.map(id => ({ id })) // Convertir IDs directamente
    };

    console.log(JSON.stringify(nuevoChatGrupal));

    // Llamar al servicio para crear el chat grupal
    this.mensajeriaService.crearChatGrupal(nuevoChatGrupal).subscribe({
      next: (response) => {

        ($ as any)('#crearGrupoModal').modal('hide');
        // Resetear el formulario
        this.nombreChat = '';
        this.imagenGrupo = null;
        this.usuariosSeleccionados = [];
      },
      error: (err) => {
        console.error('Error al crear el grupo:', err);
      }
    });
  }
}
