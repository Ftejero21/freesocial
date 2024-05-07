export interface Proyecto {
  id: number | null;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  titulo:string | null;
  link:string | null;
  descripcion: string;
  habilidadesPrincipalesProyecto: string[];
  imagenProyectoBase64?: string | null;
  imagenProyecto?: string | null;
}
