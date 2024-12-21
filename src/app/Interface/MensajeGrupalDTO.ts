export interface MensajeGrupalDTO {
  id: number;
  contenido: string;
  nombreUsuario: string;  // Nombre completo del usuario que envió el mensaje
  fechaCreacion: string;  // En Angular usaremos string para la fecha
  imagenPerfil?: string;  // Imagen de perfil en formato base64 (opcional)
  userId: number;  // ID del usuario que envió el mensaje
}
