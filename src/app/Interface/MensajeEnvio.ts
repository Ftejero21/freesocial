export interface MensajeEnvio{
  id:number | undefined
  receptorId:number,
  contenido:String,
  imagenMensajeBase64?:string
  archivoMensajeBase64?:string
}
