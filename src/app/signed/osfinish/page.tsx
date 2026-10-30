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
import { Space, Table, Input, Button, Tooltip } from "antd";
import { useState } from "react";
import { PrinterOutlined, CheckOutlined } from "@ant-design/icons";
import { useInvalidate } from "@refinedev/core";
import next from 'next';

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
    queryOptions: { refetchInterval: 10000 },
   
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

  const handleFinish = async (record: any) => {

      const tokenx = await getCookieClient();
      try {
          await api.put(`/os/${record.ordem.id}?action=fimacabamento`, {  }, {
            headers: { Authorization: `Bearer ${tokenx}` },
          });

          invalidate({ resource: "os?action=finishing", invalidates: ["list"] });

      } catch (err) {
        console.log(err);
        next;
      }

  };
  const handlebarcode = async (pedido: string) => {

      const tokenx = await getCookieClient();
      const order = await api.get("/order/find?numero=" + pedido, 
        {
          headers: { Authorization: `Bearer ${tokenx}`}
        });
        console.log(order.data);
      if (order) {
        await handleFinish({ordem: {id: order.data.id}})
        invalidate({ resource: "os?action=finishing", invalidates: ["list"] });
      }
        
  };

  return (
    <List>
        <Input
            maxLength={36}  
                     
          name="finalizar"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const input = e.target as HTMLInputElement;
              handleFinish({ordem: {id: input.value}});
              input.value = ""
            }
          }}
        />

      <Table {...tableProps} rowKey="numero">
        <Table.Column dataIndex="numero" title={"OS Nr."} />
        <Table.Column
          title="Franquia"
          render={(_, record: any) => (
            <Space size="small">
              <span>{record?.franqueado.nomefantasia}</span>
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
              {/* <EditButton hideText size="small" recordItemId={record.numero} />
              <DeleteButton hideText size="small" recordItemId={record.numero} /> */}
              {record.completada && (
                <Tooltip title="Finalizar">
                  <Button
                    type="primary"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={() => handleFinish(record)}
                  >
                    Finalizar
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
