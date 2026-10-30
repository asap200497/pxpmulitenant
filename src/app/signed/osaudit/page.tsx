"use client";
import { api } from  '@/services/api'
import { getCookieClient } from "@/lib/cookieClient"
import {
  DateField,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Table, InputNumber, Button, Tooltip } from "antd";
import { useState } from "react";
import { PrinterOutlined, CheckOutlined } from "@ant-design/icons";
import { useInvalidate } from "@refinedev/core";

type ProdutoItem = {
  id: string,
  primeiro: boolean;
  pausa: boolean;
  qtdOS: number;          // Qtd OS
  qtdadicional: number;   // Solicitado (já existente)
  qtdproduzida: number;   // Impresso
  solicitar?: number;     // 👈 NOVO (do backend)
  produto: { name: string };
};

export default function BlogPostList() {
  const { tableProps } = useTable({
    pagination: { pageSize: 10 },
    syncWithLocation: true,
    queryOptions: { refetchInterval: 60000 },
  });

  // Guarda edições locais do "solicitar" por OS (record.numero) e índice do produto
  const [solicitarByRow, setSolicitarByRow] = useState<Record<string, number[]>>({});

  const setSolicitar = (osNumero: string | number, idx: number, value?: number) => {
    const key = String(osNumero);
    setSolicitarByRow((prev) => {
      const arr = [...(prev[key] ?? [])];
      arr[idx] = value ?? 0;
      return { ...prev, [key]: arr };
    });
  };

  const currentSolicitar = (osNumero: string | number, idx: number, p: ProdutoItem) => {
    const key = String(osNumero);
    // Preferir o valor editado; senão usar o que veio do backend; fallback 0
    return solicitarByRow[key]?.[idx] ?? (p.solicitar ?? 0);
  };
  const invalidate = useInvalidate();
const handlePrintExtra = async (
    osNumero: string | number,
    idx: number,
    id: string,
    value: number
  ) => {
    const key = String(osNumero);

    // Optimistic UI: clear the input immediately
    setSolicitarByRow((prev) => {
      const arr = [...(prev[key] ?? [])];
      arr[idx] = 0;
      return { ...prev, [key]: arr };
    });

    try {
      const tokenx = await getCookieClient();
      await api.post(`/os/osadd/${id}`, { qtd: value }, {
        headers: { Authorization: `Bearer ${tokenx}` },
      });

      // Ensure it stays zero even after refetch races
      setSolicitarByRow((prev) => {
        const arr = [...(prev[key] ?? [])];
        arr[idx] = 0;
        return { ...prev, [key]: arr };
      });

      invalidate({ resource: "os", invalidates: ["list"] });
    } catch (e) {
      // If you want to revert on error, put the old value back here
      setSolicitarByRow((prev) => {
        const arr = [...(prev[key] ?? [])];
        arr[idx] = value;
        return { ...prev, [key]: arr };
      });
      console.error(e);
    }
};

  const handleFinish = async (record: any) => {

      const tokenx = await getCookieClient();
      await api.put(`/os/${record.ordem.id}?action=fimimpressao`, {  }, {
        headers: { Authorization: `Bearer ${tokenx}` },
      });

      invalidate({ resource: "os", invalidates: ["list"] });

  };

  return (
    <List>
 <Table
  {...tableProps}
  rowKey="numero"
  onRow={(record: any) => ({
    style: record?.deleted ? { backgroundColor: "#ffeded" } : undefined, // soft red
  })}
>       
    {/* <Table.Column dataIndex="numero" title={"OS Nr."} /> */}
        <Table.Column
          title="OS Nr."
          render={(_, record: any) => (
            <Space size="small">
              <span>{record?.numero} {record.deleted? "DELETADO" : ""}</span>
            </Space>
          )}
        />
        <Table.Column
          title="Pedido"
          render={(_, record: any) => (
            <Space size="small">
              <span>{record?.ordem?.numero}</span>
              <ShowButton hideText size="small" recordItemId={record?.ordem?.id} />
            </Space>
          )}
        />

        <Table.Column
          title="Franquia"
          render={(_, record: any) => (
            <Space size="small">
              <span>{record?.franqueado.nomefantasia}</span>
            </Space>
          )}
        />

        <Table.Column
          title="Status"
          render={(_, record: any) => (
            <Space size="small">
              <span>{record?.status}</span>
            </Space>
          )}
        />
        <Table.Column
          title="Empresa"
          render={(_, record: any) => <>{record?.ordem?.servico?.courier?.empresa }</>}
        />

        <Table.Column
          title="CEP Pedido"
          render={(_, record: any) => <>{record?.ordem?.cepdestino}</>}
        />

        <Table.Column
          title="Produtos"
          render={(_, record: any) => {
            const itens: ProdutoItem[] = record?.produtos ?? [];
            if (!itens.length) return "-";

            return (
              <Table
                size="small"
                pagination={false}
                rowKey={(_, i) => String(i)}
                dataSource={itens}
                columns={[
                  { title: "Produto", dataIndex: ["produto", "name"] },
                  { title: "Qtd OS", dataIndex: "qtdOS", align: "right" as const },
                ]}
              />
            );
          }}
        />

        <Table.Column
          dataIndex={["created_at"]}
          title={"Data"}
          render={(value: any) => <DateField value={value} />}
        />

        <Table.Column
          title={"Ações"}
          dataIndex="actions"
          render={(_, record: BaseRecord & { numero: number; status?: string }) => (
            
            <Space>
              {/* <ShowButton hideText size="small" recordItemId={record?.ordem?.id} /> */}
              { (
                <Tooltip title="Administrar">
                  <Button
                    type="primary"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={() => handleFinish(record)}
                  >
                    Administrar
                  </Button>
                </Tooltip>
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
