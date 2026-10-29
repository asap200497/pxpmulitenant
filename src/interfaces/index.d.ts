export interface Api {
    "Api": string,
	"Version": string,
	"Date": string,
	"Build": string

}


export interface ITipoEmpresa {
	tipo: {
		id:string,
		nome:string
	}
}

export  interface EmpresaProps {
    id: string;
    empresapai_id: string;
    nomefantasia: string;
    razaosocial: string;
    cnpj: string;
    inscrestadual: string;
    inscrmunicipal: string;
    endereco: string;
    numero: string;
    complemento: string;
    cidade: string;
    estado: string;
    telefone:string;
    telefone2:string;
    created_at: Date;
    updated_at: Date;
    category_id: string; 
    funcionalidades: {
        id: string;
        nome: string;
    }[];
    _count: {
      usuariosEmpresa: number;s
    }
  usuariosEmpresa: {
      usuario: {
          id: string;
          name: string;
      };
  }[];
	tipoEmpresa: {
	  id: string,
	  nome: string
	} 
  categorias: {
      categorias: {
        name: string,
        product: { 
          name: string
        }[]
      }
  }[],

   [key: string]: any;
}

 export  interface TicketProps {
    id: string;
    status: string;
    nomefantasia: string;
    descricao: string;
    banner: string;
    inscrestadual: string;
    inscrmunicipal: string;
    endereco: string;
    numero: string;
    complemento: string;
    cidade: string;
    estado: string;
    telefone:string;
    telefone2:string;
    created_at: Date;
    updated_at: Date;
    category_id: string; 
    usuarios: {
        name: string;
        empresa: {
          empresa: {
            nomefantasia: string
          }
        }[];
     produtos: {
        id: string,
        
     }[];   
    };

	usuariosEmpresa: {
	  id: string,
	  name: string
	}
	tipoEmpresa: {
	  id: string,
	  nome: string
	} 
}


