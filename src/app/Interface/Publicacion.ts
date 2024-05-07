import { Comentario } from "./Comentario";

export interface Publicacion {
  id: number ;
  fechaPublicacion: string | null;
  texto:string ;
  titulo:string | null;
  nombre:string;
  titular:string;
  apellido:string;
  idUser:number
  imagenPerfil:string
  likeCount:number
  liked:boolean
  showComments:boolean
  comentarios:Comentario[]
  imagenPublicacionBase64?:string
  sigueAutor:boolean

}
