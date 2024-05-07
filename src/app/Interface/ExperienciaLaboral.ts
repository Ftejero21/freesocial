export interface ExperienciaLaboral {
  id: number | null;
  cargo: string;
  tipoEmpleo: string;
  nombreEmpresa: string;
  ubicacion: string;
  modoEmpleo: string;
  fechaInicio: Date | null;
  sector:string;
  fechaFin: Date | null;
  descripcion: string;
  habilidadesPrincipalesExperiencia: string[];
  tiempoTrabajado:string;
}
