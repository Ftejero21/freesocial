export interface Comentario {
id?: number | null;
texto:string |null;
nombreCompleto?:string|null;
fechaCreacion?:string|null;
imagenPerfilBase64?:string|null;
titular?:string|null;
isNew?: boolean;
comentarioPadreId?:number;
respuestas?:Comentario[]
mostrarRespuestas?: boolean;
escribiendoRespuesta?: boolean;
  textoRespuesta?: string;
  userId?:number;
}
