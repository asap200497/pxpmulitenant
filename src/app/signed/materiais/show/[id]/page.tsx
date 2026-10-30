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



  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={record?.id} />
      <Title level={5}>{"Nome"}</Title>
      <TextField value={record?.produto} />
      <Title level={5}>{"Padrao"}</Title>
      <TextField value={"A"+record?.padrao} />
      <Title level={5}>{"Valor"}</Title>
      <TextField value={record?.insumo} />
      <Title level={5}>{"Tangivel"}</Title>
      <TextField value={record?.tangivel ? "Sim" : "Nao"} />
      <Title level={5}>{"Custo Producao"}</Title>
      <TextField value={record?.custoproducao.valor} />
      <Title level={5}>{"Markup"}</Title>
      <TextField value={record?.markupproducao.valor} />

      </Show>
  );
}
