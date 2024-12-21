import { Educacion } from "./Educacion";

export interface Usuario {
  id: number | null;
  email: string;
  password: string;
  nombreCompleto:string
  roles: Rol[];
  datosPersonales: DatosPersonales;
  contratanteData?: ContratanteData;
  freelancerData?: FreelancerData;
  imagenPerfilBase64?: string | null;
  imagenBackgroundBase64?: string | null;
  imagenPerfil?: string | null;
  imagenBackground?: string | null;
  fechaCreacion?:Date
  titular?:string
  descripcion?:string
  aparicionBusqueda:number;
  estado:string

}

export interface Rol {
  id: number;
}

export interface DatosPersonales {
  nombre: string;
  apellidos: string;
  telefono: string;
  fechaNacimiento: string;
  ciudad: string;
}

export interface ContratanteData {
  empresa: string;
}


export interface FreelancerData {
  habilidades: string[];
  habilidadesPrincipales?:string[];
  intereses: string[];
}


