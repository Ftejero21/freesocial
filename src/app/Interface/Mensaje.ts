export interface Mensaje {
  id?: number;
  userId?: number;
  fechaCreacion?: string;
  contenido: string;
  chatId?: number;
  leido?:boolean;
  nombreRemitente: string;
  imagenMensaje:string
  reaccion:string
  edit:boolean
}
