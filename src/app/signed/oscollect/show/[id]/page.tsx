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
  Button,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import React from "react";
import { DownloadOutlined, FileTextOutlined, FilePdfOutlined } from "@ant-design/icons";
import { api } from "@/services/api";
import { getCookieClient } from "@/lib/cookieClient"


const { Title, Text, Link } = Typography;

interface IProdutoRef {
  id: string;
  name: string;
}

interface IProdutos {
  preco: string;
  quantidade: number;
  produtos: IProdutoRef;
}

interface INota {
  uid: string;
  status?: string;
  numero?: number | string;
  created_at?: string;
}

interface IRecord {
  id: string;
  numero?: string | number;
  status?: string;
  observacao?: string;

  produtos?: IProdutos[];

  total?: string | number;
  frete_preco?: string | number;

  endereco?: string;
  numerodestino?: string | number;
  cepdestino?: string;

  servico?: {
    descricao?: string;
    courier?: { empresa?: string };
  };

  linkpgto?: string;

  notas?: INota[];
}

const toNumber = (v: unknown) => {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;

  if (typeof v === "string") {
    const s = v.trim().replace(/R\$\s?/i, "");
    if (s.includes(",")) {
      const normalized = s.replace(/\./g, "").replace(",", ".");
      const n = Number(normalized);
      return Number.isFinite(n) ? n : 0;
    } else {
      const n = Number(s);
      return Number.isFinite(n) ? n : 0;
    }
  }
  return 0;
};

const money = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

const statusColor = (s?: string) => {
  const map: Record<string, string> = {
    CRIADO: "default",
    EMPAGAMENTO: "processing",
    AUTORIZADO: "blue",
    PAGO: "green",
    CANCELADO: "red",
    FALHA: "red",
    FATURADO: "gold",
    APROVADA: "green",
  };
  return s ? map[s] ?? "default" : "default";
};

function formatDateISOToBR(iso?: string) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso;
  }
}

function safeFilename(s: string) {
  return s.replace(/[^\w.\-]+/g, "_");
}

type NotaDownloadType = "xml" | "pdf";

// map logical type -> your backend endpoint
function endpointByType(uid: string, type: NotaDownloadType) {
  // adjust to your routes if needed, e.g. `/os/order/notas/${uid}?type=xml`
  if (type === "xml") return `/Nfe/${uid}/xml`;
  return `/Nfe/${uid}/pdf`;
}

async function downloadNota(nota: INota, pedidoNumero?: string | number, type: NotaDownloadType = "xml") {
  const uid = nota.uid;
  const url = endpointByType(uid, type);
  const ext = type === "xml" ? "xml" : "pdf";

  const baseName = `NF-${pedidoNumero ?? nota.numero ?? ""}-${uid}.${ext}`;
  const filename = safeFilename(baseName);

  try {
        const token = await getCookieClient();
    const { data } = await api.get<ArrayBuffer>(url, { headers: { Authorization : `Bearer ${token}`} , responseType: "blob" });
    const blob = new Blob([data], { type: type === "xml" ? "application/xml" : "application/pdf" });
    const href = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);

    message.success(`Download iniciado: ${filename}`);
  } catch (err: any) {
    console.error(err);
    message.error(`Falha ao baixar ${ext.toUpperCase()} da nota.`);
  }
}

export default function BlogPostShow() {
  const { params } = useParsed();
  const id = params?.id as string;

  const { query } = useShow<IRecord>({
    resource: "os/order",
    id,
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

  // notas table
  const notas = record?.notas ?? [];
  const notasColumns: ColumnsType<INota & { key: string }> = [
    { title: "Número", dataIndex: "numero", width: 100 },
    {
      title: "Status",
      dataIndex: "status",
      render: (v?: string) => <Tag color={statusColor(v)}>{v ?? "-"}</Tag>,
      width: 140,
    },
    {
      title: "Criada em",
      dataIndex: "created_at",
      render: (v?: string) => formatDateISOToBR(v),
      width: 200,
    },
    {
      title: "Ações",
      key: "actions",
      align: "right",
      render: (_, nota) => (
        <Space>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => downloadNota(nota, record?.numero, "xml")}
          >
            XML
          </Button>
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={() => downloadNota(nota, record?.numero, "pdf")}
          >
            PDF
          </Button>
        </Space>
      ),
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
            <Descriptions.Item label="Frete">
              {[
                record?.servico?.courier?.empresa ?? "",
                record?.servico?.descricao ?? "",
              ]
                .filter(Boolean)
                .join(" - ") || "-"}
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

        {/* Notas fiscais */}
        <Card>
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Title level={5} style={{ marginBottom: 16 }}>
              Notas fiscais
            </Title>
            {notas.length > 0 && (
              <Button
                icon={<DownloadOutlined />}
                onClick={() => {
                  // exemplo: baixar todos os XMLs (ajuste conforme sua API)
                  notas.forEach((n) => downloadNota(n, record?.numero, "xml"));
                }}
              >
                Baixar todos (XML)
              </Button>
            )}
          </Space>

          <Table
            size="small"
            rowKey={(n) => n.uid}
            dataSource={notas.map((n) => ({ ...n, key: n.uid }))}
            columns={notasColumns}
            pagination={false}
            bordered
            locale={{ emptyText: "Nenhuma nota disponível" }}
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
