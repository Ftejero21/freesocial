export interface Notificacion{
  id:number;
  tipo: string;
  datos: {
    imagenPerfil: string;
    titular:string;
    nombreCompleto:string;
    comentario:string
  };
  fechaCreacion: string;
  leido:boolean;
}
