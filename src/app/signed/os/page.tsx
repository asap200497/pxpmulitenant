"use client";
import { api } from  '@/services/api'
import { getCookieClient } from "@/lib/cookieClient"
import {
  DateField,
  List,
  ShowButton,
  useTable,
  useSelect
} from "@refinedev/antd";
import { type BaseRecord , } from "@refinedev/core";
import { Space, Table, InputNumber, Button, Tooltip, Checkbox ,Modal,  Select} from "antd";
import { useState } from "react";
import {  CloseCircleOutlined , ExclamationCircleOutlined , CloudDownloadOutlined, PrinterOutlined, CheckOutlined, EyeFilled } from "@ant-design/icons";
import { useInvalidate } from "@refinedev/core";
import robotsleep from '/public/sleep.png';
import Image from 'next/image';
import toast from 'react-hot-toast';


type ProdutoItem = {
  id: string,
  primeiro: boolean;
  capa: boolean;
  pausa: boolean;
  qtdOS: number;          // Qtd OS
  qtdadicional: number;   // Solicitado (já existente)
  qtdproduzida: number;   // Impresso
  status: String,
  solicitar?: number;     // 👈 NOVO (do backend)
  produto: { name: string };
};

export default function OSList() {


  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<BaseRecord | null>(null);

  const { tableProps } = useTable({
    pagination: { pageSize: 10 },
    syncWithLocation: true,
    queryOptions: { refetchInterval: 10000 },
  });
const { selectProps } = useSelect({
  resource: "parametros/impressora/printers",
  optionLabel: "shortname",
  optionValue: "id",
  filters: [
    { field: "shortname", operator: "ne", value: null as any }, // not null
    { field: "shortname", operator: "ne", value: "" },          // not empty string
  ],
});

type Opt = { label: React.ReactNode; value: string | number };
const printerOptions: Opt[] = (selectProps?.options ?? []).map((o: any) => ({
  label: o.label,
  value: o.value as string | number, // ensure primitive
}));
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

const [selectedExtras, setSelectedExtras] = useState<Record<string, string | number | undefined>>({});
const rowKey = (osNr: string | number, idx: number) => `${osNr}:${idx}`;
const {
  defaultValue: _ignoreDefault,         // <-- remove conflicting defaultValue
  labelInValue: _ignoreLabelInValue,    // <-- remove labelInValue if present
  ...safeSelectProps
} = selectProps ?? {};


const handlePrintExtra = async ( osNumero: string | number,  idx: number,  id: string,  value: number , idprinter: string ) => {

    const key = String(osNumero);

    
    if (value == 0) {
      return;
    }

        
    // Optimistic UI: clear the input immediately
    setSolicitarByRow((prev) => {
      const arr = [...(prev[key] ?? [])];
      arr[idx] = 0;
      return { ...prev, [key]: arr };
    });

    try {
      const tokenx = await getCookieClient();
      await api.post(`/os/osadd/${id}`, { qtd: value, printer: idprinter }, {
        headers: { Authorization: `Bearer ${tokenx}` },
      });

      // Ensure it stays zero even after refetch races
      setSolicitarByRow((prev) => {
        const arr = [...(prev[key] ?? [])];
        arr[idx] = 0;
        return { ...prev, [key]: arr };
      });
      invalidate({ resource: "os?action=printing", invalidates: ["list"] });
      toast.success('Solicitação enviada com sucesso!');
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
      toast.success('Ordem de Serviço finalizada com sucesso!');
      invalidate({ resource: "os?action=printing", invalidates: ["list"] });

  };
  const handleCustomAction = (record: BaseRecord) => {
    setSelectedProduct(record);
    setModalOpen(true);
  };
  return (
    <List>
      <Table {...tableProps} rowKey="numero">
        <Table.Column
          title="OS Nr"
          render={(_, record: any) => (
            <Space size="small">
              <span>{record?.numero}</span>
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
          title="Status"
          render={(_, record: any) => <>{record?.status}</>}
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
    //              { title: "Produto", dataIndex: ["produto", "name"] },
                  {
                    title: "Produto",
                    render: (_: any, p: ProdutoItem) => {
                      const name = p?.produto?.name ?? "";
                      return p?.capa ? `${name}/Capa` : `${name}/Meio`;
                    },
                  },
                  {
                    title: "",
                    render: (_: any, p: ProdutoItem) => {
                      return  <Button size="small" icon={<EyeFilled />} onClick={() => handleCustomAction(p.produto)} /> ;
                    },
                  },
                  { title: "Qtd OS", dataIndex: "qtdOS", align: "right" as const },
                  { title: "Impresso", dataIndex: "qtdproduzida", align: "right" as const },
                  { title: "Solicitado", dataIndex: "qtdadicional", align: "right" as const },
                  { title: "", dataIndex: "status", align: "center" as const,
                    render: (_: any, p: ProdutoItem) => {
                      if (p.status == "PAUSADO" && p.qtdadicional > 0) {
                        return  <Image src={robotsleep} width={30} alt="Aguarde"></Image>
                      }
                      if (p.status == "DOWNLOADING") {
                         return  <CloudDownloadOutlined style={{ fontSize: 20, color: "green" }} />

                      }
                      if (p.status == "IMPRESSAO") {
                         return  <PrinterOutlined style={{ fontSize: 20, color: "green" }} />

                      }
                      if (p.status == "CANCELADO") {
                         return  <CloseCircleOutlined style={{ fontSize: 20, color: "green" }} />

                      }
                      if (p.status == "ERRO") {
                         return  <ExclamationCircleOutlined spin style={{ fontSize: 20, color: "green" }} />

                      }
                    } 
                  },
                  // Ca},mpo calculado vindo do backend (solicitar) + editável
                  {
                    title: "Imprimir",
                    align: "center" as const,
                    render: (_: any, p: ProdutoItem, idx: number) => {
                      const osNr = record.numero;
                      const value = currentSolicitar(osNr, idx, p);
                      const key = rowKey(osNr, idx);

                      return (
                        <Space>
                          <InputNumber
                            min={0}
                            value={value}
                            name="solicitar"
                            onChange={(v) => setSolicitar(osNr, idx, (v as number) ?? 0)}
                          />
                          <Select<string | number>
                            // No spread of selectProps to avoid defaultValue/labelInValue conflicts
                            options={printerOptions}
                            value={selectedExtras[key]}
                            onChange={(val) =>
                              setSelectedExtras((prev) => ({ ...prev, [key]: val }))
                            }
                            placeholder="Selecione o extra"
                            style={{ minWidth: 80 }}
                            showSearch
                            optionFilterProp="label"
                          />
                          <Tooltip title="Imprimir adicional">
                            <Button
                              type="primary"
                              size="small"
                              icon={<PrinterOutlined />}
                              onClick={() =>{ 
                                handlePrintExtra(osNr,idx, p.id, value, selectedExtras[key] as string)                                
                              }}
                            />
                          </Tooltip>
                        </Space>
                      );
                    },
                  },
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
            <Modal
        open={modalOpen}
        title={`Produto ${selectedProduct?.name}`}
        onCancel={() => setModalOpen(false)}
        footer={null}
    >
          <ul style={{ paddingLeft: 20 }}>
                  {selectedProduct?.items.map((item : any) => (
                                    <li key={item.id}>
                                        <strong>{item.material?.produto || "Produto"}</strong> – Qtd: {item.quantity}
                                    </li>
                                ))
                  }
                  </ul>
        </Modal>

    </List>
  );
}
