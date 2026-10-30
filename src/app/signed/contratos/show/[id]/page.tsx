"use client";

import { Show, TextField, NumberField, DateField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Divider, List, Descriptions, Space } from "antd";

const { Title } = Typography;

export default function BlogPostShow() {
  const { query } = useShow({});
  const { data, isLoading } = query;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={4}>Contrato #{record?.numero}</Title>

      <Descriptions
        bordered
        size="middle"
        column={1}
        labelStyle={{ width: 150 }}
      >
        <Descriptions.Item label="ID">
          <TextField value={record?.id} />
        </Descriptions.Item>

        <Descriptions.Item label="Cliente">
          <TextField value={record?.nomefantasia ?? record?.empresa?.nomefantasia} />
        </Descriptions.Item>

        <Descriptions.Item label="Descrição">
          <TextField value={record?.descricao} />
        </Descriptions.Item>

        <Descriptions.Item label="Criado em">
          <DateField value={record?.created_at} />
        </Descriptions.Item>

        <Descriptions.Item label="Vencimento">
          <DateField value={record?.vencimento} />
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left" style={{ marginTop: 32 }}>
        Itens do Contrato
      </Divider>

      <List
        bordered
        dataSource={record?.items ?? []}
        renderItem={(item : any, index) => (
          <List.Item>
            <Space direction="vertical" size={0}>
              <TextField value={item?.produto} />
              <span style={{ fontSize: 12, color: "gray" }}>
                Preço: <NumberField value={item?.preco} options={{ style: "currency", currency: "BRL" }} />
              </span>
            </Space>
          </List.Item>
        )}
      />
    </Show>
  );
}
