"use client";

import { DateField, MarkdownField, Show, TextField } from "@refinedev/antd";
import { useOne, useShow } from "@refinedev/core";
import { Typography } from "antd";

const { Title } = Typography;


  interface IGrupos {
    grupo: {
      id: string,
      nome: string
    }
  }

  interface IEmpresas {
    empresa: {
      id: string,
      nomefantasia: string
    }
  }



export default function BlogPostShow() {
  const { query } = useShow({});
  const { data, isLoading } = query;

  const record = data?.data;



  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={record?.id} />
      <Title level={5}>{"Login"}</Title>
      <TextField value={record?.login} />
      <Title level={5}>{"Nome"}</Title>
      <TextField value={record?.name} />
      <Title level={5}>{"CPF"}</Title>
      <TextField value={record?.cpf} />
      <Title level={5}>{"Email"}</Title>
      <TextField value={record?.email} />
      <Title level={5}>{"Telefone1"}</Title>
      <TextField value={record?.telefone1} />
      <Title level={5}>{"Telefone2"}</Title>
      <TextField value={record?.telefone2} />
      <Title level={5}>{"Troca senha"}</Title>
      <TextField value={record?.lastchange} />
      <Title level={5}>{"Data Criacao"}</Title>
      <DateField value={record?.created_at} />

      <Title level={5}>{"Grupos"}</Title>
      <TextField value={record?.grupos.map((ip: IGrupos) => ip.grupo.nome).join(",")} />
      <Title level={5}>{"Empresas"}</Title>
      <TextField value={record?.empresa.map((ip: IEmpresas) => ip.empresa.nomefantasia).join(",")} />

      </Show>
  );
}
