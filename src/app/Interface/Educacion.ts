export interface Educacion {
  id: number | null;
  institucion?: string;
  fechaInicio?: Date | null;
  fechaFin?: Date | null;
  titulo:string
  disciplinaAcademica:string
  nota:Number | null
  actividadesExtraEscolares:string
  descripcion:string
  habilidadesPrincipalesEducacion?:string[];

}
