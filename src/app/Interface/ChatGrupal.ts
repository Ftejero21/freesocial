import { Mensaje } from "./Mensaje";
import { Usuario } from "./UsuarioRegistro";

export interface ChatGrupal{
  id: number;  // El campo id es opcional
  nombreChat: string;
  usuarios: Usuario[];
  imagenGrupoBase64: string;
  ultimoMensaje?: Mensaje;
}
