"use client";

import { Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography } from "antd";

const { Title } = Typography;

export default function BlogPostShow() {
  const { query } = useShow({});
  const { data, isLoading } = query;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>ID</Title>
      <TextField value={record?.id} />

      <Title level={5}>Nome</Title>
      <TextField value={record?.produto} />

      <Title level={5}>Padrão</Title>
      <TextField value={`A${record?.padrao}`} />

      <Title level={5}>Valor</Title>
      <TextField value={`R$ ${record?.insumo}`} />

      <Title level={5}>Preços Especiais</Title>
      <TextField
        value={
          record?.precosespeciais
            ?.map((item: any) => `${item.empresa_nome}: R$ ${item.preco}`)
            .join(" | ") || "Nenhum"
        }
      />

      <Title level={5}>Tangível</Title>
      <TextField value={record?.tangivel ? "Sim" : "Não"} />

      {/* <Title level={5}>Custo Produção</Title>
      <TextField value={`R$ ${record?.custoproducao?.valor || "0"}`} />

      <Title level={5}>Markup Produção</Title>
      <TextField value={`R$ ${record?.markupproducao?.valor || "0"}`} /> */}
    </Show>
  );
}
