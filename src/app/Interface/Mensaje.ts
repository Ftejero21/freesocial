export interface Mensaje {
  id?: number;
  userId?: number;
  fechaCreacion?: string;
  contenido?: string;
  chatId?: number;
  leido?:boolean;
  imagenMensaje:string
}
