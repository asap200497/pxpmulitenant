"use client";

import { DateField, MarkdownField, Show, TextField } from "@refinedev/antd";
import { useOne, useShow } from "@refinedev/core";
import { Typography } from "antd";

const { Title } = Typography;

interface IFuncionalidades {
    funcionalidade: {
      id: string,
      nome: string
    }
  }

interface IUsuario {
    usuario: {
      id: string,
      login: string
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
      <Title level={5}>{"Empresa"}</Title>
      <TextField value={record?.empresa.nomefantasia} />
      <Title level={5}>{"Serial"}</Title>
      <TextField value={record?.serial} />
    </Show>
  );
}

    //  <TextField value={record?.grupos.map((ip: IGrupos) => ip.grupo.nome).join(",")} />