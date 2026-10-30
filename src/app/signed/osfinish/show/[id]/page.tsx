"use client";

import { Show } from "@refinedev/antd";
import { useShow, useParsed } from "@refinedev/core";
import {
  Typography,
  Descriptions,
  Table,
  Tag,
  Divider,
  Card,
  Space,
  Statistic,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import React from "react";

const { Title, Text, Link } = Typography;

interface IProdutoRef {
  id: string;
  name: string;
}

interface IProdutos {
  preco: string;          // e.g. "16,71" or "16.71"
  quantidade: number;
  produtos: IProdutoRef;
}

interface IRecord {
  id: string,
  numero?: string | number;
  status?: string;
  observacao?: string;

  produtos?: IProdutos[];

  total?: string | number;          // material total
  frete_preco?: string | number;    // freight value

  endereco?: string;
  numerodestino?: string | number;
  cepdestino?: string;

  servico?: {
    descricao?: string;
    courier?: { empresa?: string };
  };

  linkpgto?: string;
}
const toNumber = (v: unknown) => {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;

  if (typeof v === "string") {
    // remove currency symbol and spaces
    const s = v.trim().replace(/R\$\s?/i, "");

    if (s.includes(",")) {
      // BR format: 1.234,56  -> 1234.56
      const normalized = s.replace(/\./g, "").replace(",", ".");
      const n = Number(normalized);
      return Number.isFinite(n) ? n : 0;
    } else {
      // EN format or plain integer: 1234.56 or 1234
      const n = Number(s);
      return Number.isFinite(n) ? n : 0;
    }
  }

  return 0;
};
const money = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    n || 0
  );

const statusColor = (s?: string) => {
  const map: Record<string, string> = {
    CRIADO: "default",
    EMPAGAMENTO: "processing",
    AUTORIZADO: "blue",
    PAGO: "green",
    CANCELADO: "red",
    FALHA: "red",
  };
  return s ? map[s] ?? "default" : "default";
};

export default function BlogPostShow() {
  const { params } = useParsed();         // needs refine router binding
  const id = params?.id as string;  

  const { query } = useShow<IRecord>({
    resource: "os/order", 
    id
    
  });
  const { data, isLoading } = query;
  const record = data?.data;

  // Derivations
  const itens = record?.produtos ?? [];
  const rows = itens.map((item, idx) => {
    const unit = toNumber(item.preco);
    const subtotal = unit * (item.quantidade ?? 0);
    return {
      key: idx,
      produto: item.produtos?.name ?? "-",
      quantidade: item.quantidade ?? 0,
      preco: unit,
      subtotal,
    };
  });

  const totalMaterial =
    rows.reduce((acc, r) => acc + (r.subtotal ?? 0), 0) || toNumber(record?.total);

  const frete = toNumber(record?.frete_preco);
  const totalGeral = totalMaterial + frete;

  const columns: ColumnsType<(typeof rows)[number]> = [
    { title: "Produto", dataIndex: "produto" },
    {
      title: "Quantidade",
      dataIndex: "quantidade",
      align: "right",
      render: (v) => <Text>{v}</Text>,
    },
    {
      title: "Preço unitário",
      dataIndex: "preco",
      align: "right",
      render: (v: number) => <Text>{money(v)}</Text>,
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      align: "right",
      render: (v: number) => <Text strong>{money(v)}</Text>,
    },
  ];

  return (
    <Show isLoading={isLoading}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header / Basic Info */}
        <Card>
          <Title level={4} style={{ marginBottom: 0 }}>
            Pedido {record?.numero ?? "-"}
          </Title>
          <Text type="secondary">Detalhes do pedido</Text>

          <Divider />

          <Descriptions
            column={{ xs: 1, sm: 2, md: 3 }}
            labelStyle={{ fontWeight: 600 }}
          >
            <Descriptions.Item label="Número">
              {record?.numero ?? "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={statusColor(record?.status)}>
                {record?.status ?? "-"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Observações">
              {record?.observacao?.trim() || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Endereço de destino" span={2}>
              {[
                record?.endereco,
                record?.numerodestino ? `nr ${record.numerodestino}` : "",
                record?.cepdestino ? `CEP ${record.cepdestino}` : "",
              ]
                .filter(Boolean)
                .join(", ") || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Frete">
              {[
                record?.servico?.courier?.empresa ?? "",
                record?.servico?.descricao ?? "",
              ]
                .filter(Boolean)
                .join(" - ") || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Link de Pagamento" span={3}>
              {record?.linkpgto ? (
                <Link href={record.linkpgto} target="_blank" rel="noopener noreferrer" copyable>
                  {record.linkpgto}
                </Link>
              ) : (
                "-"
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Produtos */}
        <Card>
          <Title level={5} style={{ marginBottom: 16 }}>
            Produtos
          </Title>
          <Table
            size="small"
            dataSource={rows}
            columns={columns}
            pagination={false}
            bordered
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3} align="right">
                    <Text strong>Total Material</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <Text strong>{money(totalMaterial)}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>

        {/* Totais */}
        <Card>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Space size="large" wrap>
              <Statistic title="Total Material" value={money(totalMaterial)} />
              <Statistic title="Frete" value={money(frete)} />
              <Statistic
                title="Total Geral"
                value={money(totalGeral)}
                valueStyle={{ fontWeight: 700 }}
              />
            </Space>
          </Space>
        </Card>
      </Space>
    </Show>
  );
}
