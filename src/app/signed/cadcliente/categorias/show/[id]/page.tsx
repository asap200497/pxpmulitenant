"use client";

import { DateField, MarkdownField, Show, TextField } from "@refinedev/antd";
import { useOne, useShow } from "@refinedev/core";
import { Typography } from "antd";

import { EmpresaProps, ITipoEmpresa } from "@/interfaces/index";

const { Title } = Typography;


export default function BlogPostShow() {
  const { query } = useShow({});
  const { data, isLoading } = query;

  const record = data?.data;



  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={record?.id} />
      <Title level={5}>{"CPF"}</Title>
      <TextField value={record?.cpf} />
      <Title level={5}>{"Nome"}</Title>
      <TextField value={record?.name} />
      <Title level={5}>{"Data Criacao"}</Title>
      <DateField value={record?.created_at} />

      <Title level={5}>{"Empresas"}</Title>
      <TextField value={record?.empresas.map((ip: EmpresaProps ) => ip.nomefantasia).join(",")} />

      </Show>
  );
}
