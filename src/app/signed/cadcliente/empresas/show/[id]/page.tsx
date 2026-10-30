"use client";



import { DateField, MarkdownField, Show, TextField } from "@refinedev/antd";
import { useOne, useShow } from "@refinedev/core";
import { Typography } from "antd";

const { Title } = Typography;


  interface ITipoEmpresa {
    tipo: {
      id: string,
      nome: string
    }
  }

    interface IUsuarioEmpresa {
    usuario: {
      id: string,
      name: string
    }
  }



export default function BlogPostShow() {

  const { query } = useShow({});
  const { data, isLoading } = query;

  const record = data?.data;

  const parentId = record?.empresapai_id;
    // 👇 Fetch parent company if exists
  const empresapai = useOne({
    resource: "empresas",
    id: parentId,
    queryOptions: {
      enabled: !!parentId,
    },
  }).query;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={record?.id} />
      <Title level={5}>{"Nome Fantasia"}</Title>
      <TextField value={record?.nomefantasia} />
      <Title level={5}>{"Razao Socal"}</Title>
      <TextField value={record?.razaosocial} />
      <Title level={5}>{"Ativa"}</Title>
      <TextField value={record?.habilitada ? "SIM": "NAO"} />     
      <Title level={5}>{"CNPJ"}</Title>
      <TextField value={record?.cnpj} />
      <Title level={5}>{"Inscr Estadual"}</Title>
      <TextField value={record?.inscrestadual} />
      <Title level={5}>{"Inscr Municipal"}</Title>
      <TextField value={record?.inscrmunicipal} />
      <Title level={5}>{"CEP"}</Title>
      <TextField value={record?.cep} />
      <Title level={5}>{"Endereco"}</Title>
      <TextField value={record?.endereco} />
      <Title level={5}>{"Cidade"}</Title>
      <TextField value={record?.cidade} />
      <Title level={5}>{"Estado"}</Title>
      <TextField value={record?.estado} />
      <Title level={5}>{"Data Criacao"}</Title>
      <DateField value={record?.created_at} />
      <Title level={5}>{"Tipo de Empresa"}</Title>
      <TextField value={record?.tipoEmpresa.map((ip: ITipoEmpresa) => ip.tipo.nome).join(",")} />
      <Title level={4}>Empresa Pai</Title>
      <TextField value={empresapai?.data?.data.nomefantasia || "Nao ha"} />

      <Title level={5}>{"Usuarios"}</Title>
      <TextField value={record?.usuariosEmpresa.map((ip: IUsuarioEmpresa) => ip.usuario.name).join(",")} />

      </Show>
  );
}
