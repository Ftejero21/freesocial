import { Mensaje } from "./Mensaje";

export interface Chat {
  id: number;
  userId: number;
  receptorId: number | undefined;
  nombreCompletoReceptor: string | undefined;
  imagenPerfilReceptorBase64:string | undefined;
  titularReceptor?:string
  nuevoMensaje?: boolean;
  mensajesNoLeidos?:number;
  mensajes: Mensaje[];
  online?: boolean;
  esBorrador?: boolean;
  mensajeNuevo?: string;
}
