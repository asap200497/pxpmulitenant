"use client";



import { DateField, MarkdownField, Show, TextField } from "@refinedev/antd";
import { useOne, useShow } from "@refinedev/core";
import { Typography } from "antd";


const { Title, Paragraph } = Typography;

interface ICategory {
  id: string,
  name: string,
  empresas: {
    empresas: {
      id: string,
      nomefantasia: string
    }
  }
}


export default function BlogPostShow() {

  const { query } = useShow({});
  const { data, isLoading } = query;

  const record = data?.data;

  const parentId = record?.empresapai_id;
    // 👇 Fetch parent company if exists


  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={record?.id} />
      <Title level={5}>{"Nome"}</Title>
      <TextField value={record?.name} />
      <Title level={5}>{"Categoria e Empresas"}</Title>
      {record?.category && (
        <div style={{ marginLeft: 8 }}>
          <Paragraph strong>{record.category.name}</Paragraph>
          {record.category.empresas?.map((e: any, idx: number) => (
            <Paragraph key={idx} style={{ marginLeft: 16 }}>
              • {e.empresas?.nomefantasia}
            </Paragraph>
          ))}
        </div>
      )}


      </Show>
  );
}
