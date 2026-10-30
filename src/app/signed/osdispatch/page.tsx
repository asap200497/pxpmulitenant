"use client";
import { api } from "@/services/api";
import { getCookieClient } from "@/lib/cookieClient";
import {
  DateField,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord, useInvalidate } from "@refinedev/core";
import {
  Space,
  Table,
  Input,
  Button,
  Tooltip,
  Modal,
  Tag,
  message,
  InputNumber,
} from "antd";
import { CheckOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import type { InputRef } from "antd";

type ProdutoItem = {
  id: string;
  primeiro: boolean;
  pausa: boolean;
  qtdOS: number;
  qtdadicional: number;
  qtdproduzida: number;
  status: string;
  solicitar?: number;
  produto: { name: string };
};

type ProdutoOS = {
  id: string;
  capa: boolean;
  qtdOS: number;
  produto: { name: string };   // <-- era string; agora segue o payload
  _count: { seriais: number };  // atenção: no payload é "seriais"
};


type Order = { id: string; numero: number; total: number; OS: { produtos: ProdutoOS[] }[] ; pesoreal: Number};

type SemItem = { serial: string; ok: boolean };
type ComItem = { serial: string; ok: boolean };

export default function BlogPostList() {

  const [osId, setOsId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [closeOrder, setCloseOrder] = useState(false);
  const [pesoReal, setPesoReal] = useState("");

  const [qtdVolumes, setVolumes] = useState("");

  const [numeroserie, setNumeroSerie] = useState("");
  const [numeroseriemiolo, setNumeroSerieMiolo] = useState("");

  // ===== list/table (unchanged) =====
const { tableProps } = useTable({
  pagination: { pageSize: 10 },
  syncWithLocation: true,
  queryOptions: {
    // Stop polling while modal is open
    refetchInterval: verifyOpen ? false : 10_000,
    refetchOnWindowFocus: !verifyOpen,
    refetchOnReconnect: !verifyOpen,

    // Make data “fresh” while the modal is open so no auto-refetch triggers
    staleTime: verifyOpen ? Infinity : 0,

    // v5 replacement for keepPreviousData — keeps previous page while fetching
    placeholderData: (prev) => prev,

    // // Optional: keep scanner focused after background refetch completes
    // onSuccess: () => {
    //   if (verifyOpen) {
    //     setTimeout(() => scanSemRef.current?.focus({ cursor: "end" }), 0);
    //   }
    // },
  },
});
  const invalidate = useInvalidate();

  // ===== open modal by typing OS id and pressing Enter =====
  const abrirRef = useRef<InputRef>(null);
  useEffect(() => abrirRef.current?.focus({ cursor: "end" }), []);

  // ===== modal state =====

  const [verifyLoading, setVerifyLoading] = useState(false);

  // split arrays + fast lookup
  const [pedido, setPedido] = useState<Order>();
  // scanning flow
  const scanSemRef = useRef<InputRef>(null);
  const [needsComNext, setNeedsComNext] = useState(false); // require a cover after a content

  function buildLists(order: Order) {
    setPedido(order);
    const allProdutos = (order?.OS ?? []).flatMap(o => o?.produtos ?? []);


    setNeedsComNext(false);
  }
    async function refreshPedido(currentId?: string) {
      const id = currentId ?? pedido?.id;
      if (!id) return;

      try {
        const token = await getCookieClient();
        const resp = (await api.get(`/os/order/${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${token}` },
        })).data as Order;

        if (resp) {
          buildLists(resp);
          if (isAllChecked(resp) && verifyOpen) {
            setVerifyOpen(false);
            message.success("Conferência concluída 🎉");
          }
        }
      } catch (e) {
        console.error(e);
        toast.error("Falha ao atualizar a OS");
      }
    }
  function isAllChecked(order?: Order) {
    if (!order) return false;
      return (order.OS ?? []).every(os =>
          (os.produtos ?? []).every(p =>
          (p._count?.seriais ?? 0) >= (p.qtdOS ?? 0)
         )
     );
  }

  async function openVerifyModal(osId: string) {
    setVerifyOpen(true);
    setVerifyLoading(true);
    try {
      const token = await getCookieClient();
      const resp = (await api.get(`/os/order/${encodeURIComponent(osId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })).data as Order;
      if (resp) {
        buildLists(resp);
        setTimeout(() => scanSemRef.current?.focus({ cursor: "end" }), 0);
        await api.put(`/os/${encodeURIComponent(osId)}?action=fimacabamento`, {  }, {
            headers: { Authorization: `Bearer ${token}` },
          });

      } else {
        setVerifyOpen(false);
        setVerifyLoading(false);
        toast.error("OS invalida")
      }
    } catch {
      toast.error("Falha ao carregar seriais");
      setNeedsComNext(false);
    } finally {
      setVerifyLoading(false);
    }
  }
  async function openOrderClosing(orderid: string) {
    setCloseOrder(true);
      try {
          setOrderId(orderid);
          const token = await getCookieClient();
          const resp = (await api.get(`/os/order/${encodeURIComponent(orderid)}`, {
            headers: { Authorization: `Bearer ${token}` },
          })).data as Order;
          
          if (resp) {
              const peso = parseFloat(resp.pesoreal as any);
              setVolumes("1");
              setPesoReal(peso.toFixed(0));
          } else {
              setCloseOrder(false);    
              toast.error("Falha ao carregar pedido");

          }
        
      } catch(err) {
          setCloseOrder(false);
          toast.error("Falha ao carregar pedido");
          console.log(err)
      } 
}

 // --- handleNrSerie: chame refreshPedido() após sucesso e mantenha o foco ---
const handleNrSerie = async (raw: string) => {
  const v = raw.trim();
  if (!v || !pedido?.id) return;

  try {
    const token = await getCookieClient();

    if (numeroseriemiolo === "") {
      const url = `/os/checkserial/${encodeURIComponent(pedido.id)}?serial=${encodeURIComponent(v)}`;
      const resp = await api.put(url, {}, { headers: { Authorization: `Bearer ${token}` } });

      if (resp.data === "CHECKCAPA") {
        setNumeroSerieMiolo(v);       // guarda miolo para parear com a capa
      }
      setNumeroSerie("");             // zera campo digitado
    } else {
      const url = `/os/checkcapa/${encodeURIComponent(pedido.id)}?serialmiolo=${encodeURIComponent(numeroseriemiolo)}&serialcapa=${encodeURIComponent(v)}`;
      await api.put(url, {}, { headers: { Authorization: `Bearer ${token}` } });

      setNumeroSerieMiolo("");        // finaliza o par
      setNumeroSerie("");
    }

    // <<< AQUI: refetch da OS para atualizar a tabela do modal >>>
    await refreshPedido(pedido.id);

    // Mantém o foco no scanner
    setTimeout(() => scanSemRef.current?.focus({ cursor: "end" }), 0);
  } catch (err: any) {
    console.log(err);
    setNumeroSerieMiolo("");
    setNumeroSerie("");
    toast.error(err?.response?.data ?? "Falha ao validar serial");
    setTimeout(() => scanSemRef.current?.focus({ cursor: "end" }), 0);
  }
};

  // ===== existing action (unchanged) =====
  const handleFinish = async () => {
    try {
      const tokenx = await getCookieClient();
      console.log(orderId, pesoReal, qtdVolumes);
      await api.put(`/os/${orderId}?action=fimexpedicao`, { 
         pesoreal: pesoReal,
         volumes: qtdVolumes
      }, {
        headers: { Authorization: `Bearer ${tokenx}` },
      });
    } catch (err: any) {
      toast.error(err.response?.data ?? "Erro ao finalizar");
    }
    invalidate({ resource: "os?action=dispatch", invalidates: ["list"] });
    setCloseOrder(false)
  };

  return (
    <List>
      {/* Open the verification modal */}
        <Input
          ref={abrirRef}
          maxLength={36}
          autoComplete="off"
          placeholder="Digite o OS ID e Enter"
          value={osId}
          onChange={(e) => setOsId(e.target.value)}
          onPressEnter={() => {
            const v = osId.trim();
            if (v) {
              openVerifyModal(v);
              setOsId("");                    // limpa de verdade
              setTimeout(() => abrirRef.current?.focus({ cursor: "end" }), 0);
            }
          }}
        />
      {/* Your listing table stays the same */}
      <Table {...tableProps} rowKey="numero">
        <Table.Column dataIndex="numero" title="OS Nr." />
        <Table.Column
          title="Franquia"
          render={(_, record: any) => (
            <Space size="small">
              <span>{record?.franqueado?.nomefantasia}</span>
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
        <Table.Column title="CEP Pedido" render={(_, r: any) => <>{r?.ordem?.cepdestino}</>} />
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
                  { title: "Impresso", dataIndex: "qtdproduzida", align: "right" as const },
                  { title: "Despachadas", dataIndex: ["_count", "seriais"] },
                ]}
              />
            );
          }}
        />
        <Table.Column
          dataIndex={["created_at"]}
          title="Data"
          render={(value: any) => <DateField value={value} />}
        />
        <Table.Column
          title="Ações"
          dataIndex="actions"
          render={(_, record: BaseRecord & {id:string, numero: number; status?: string ; ordem: {id: string}}) => (
            <Space>
              {record.despachadas && (
                <Tooltip title="Finalizar">
                  <Button
                    type="primary"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={() => openOrderClosing(record.ordem.id)}
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
          title={
            <Space direction="vertical" size={0}>
              <span>Conferência de Seriais Pedido # {pedido?.numero}</span>
            </Space>
          }
          open={closeOrder}
          onCancel={() => setCloseOrder(false)}
          footer={[<Button key="close" onClick={() => handleFinish()}>Fechar</Button>]}
          destroyOnClose
          width={920}
        >
            <div style={{ minWidth: 360 }}> 
              <div style={{ marginBottom: 4 }}>{ "INFORME A QTD DE VOLUMES"}</div>
              <InputNumber
                key={"volumes"}
                autoComplete="off"                
                value={qtdVolumes}
                onChange={(v) => setVolumes(v || "")}
              />
            </div>
            <div style={{ minWidth: 360 }}> 
              <div style={{ marginBottom: 4 }}>{ "INFOME O PESO REAL DE TODO PEDIDO EM GRAMAS"}</div>
              <InputNumber
                key={"peso"}
                autoComplete="off"                
                value={pesoReal}
                onChange={(v) => setPesoReal(v || "")}
              />
            </div>

        </Modal>


        <Modal
          title={
            <Space direction="vertical" size={0}>
              <span>Conferência de Seriais Pedido # {pedido?.numero}</span>
            </Space>
          }
          open={verifyOpen}
          onCancel={() => setVerifyOpen(false)}
          footer={[<Button key="close" onClick={() => setVerifyOpen(false)}>Fechar</Button>]}
          destroyOnClose
          width={920}
        >
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            {/* Scanner */}
            <div style={{ minWidth: 360 }}> 
              <div style={{ marginBottom: 4 }}>{ numeroseriemiolo? "SCANEIE CAPA" : "SCANEIE MIOLO"}</div>
              <Input
                ref={scanSemRef}
                autoComplete="off"
                placeholder={"Leia o serial"}
                value={numeroserie}
                onChange={(e) => setNumeroSerie(e.target.value)}
                onPressEnter={() => {
                  const v = numeroserie.trim();
                  setNumeroSerie(""); // limpa input
                  handleNrSerie(v);
                  setTimeout(() => scanSemRef.current?.focus({ cursor: "end" }), 0);
                }}
              />
            </div>

            {/* Tabelas por OS */}
            {(pedido?.OS ?? []).map((os, idx) => {
              const data = (os?.produtos ?? []).map((p) => ({
                key: p.id,
                produto: p.produto?.name ?? "-",
                tipo: p.capa ? "CAPA" : "MIOLO",
                qtdOS: p.qtdOS ?? 0,
                conferidos: p._count?.seriais ?? 0,
                done: (p._count?.seriais ?? 0) >= (p.qtdOS ?? 0),
              }));

              return (
                <div key={idx} style={{ width: "100%" }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>OS #{idx + 1}</div>
                  <Table
                    size="small"
                    dataSource={data}
                    pagination={false}
                    rowKey="key"
                    rowClassName={(r) => (r.done ? "row-done" : "")}
                    columns={[
                      { title: "Produto", dataIndex: "produto" },
                      {
                        title: "Tipo",
                        dataIndex: "tipo",
                        render: (v: string) => (
                          <Tag color={v === "CAPA" ? "geekblue" : "default"}>{v}</Tag>
                        ),
                        width: 110,
                      },
//                      { title: "Qtd OS", dataIndex: "qtdOS", align: "right" as const, width: 100 },
                      {
                        title: "Conferidos",
                        dataIndex: "conferidos",
                        align: "right" as const,
                        width: 120,
                        render: (_: any, r: any) => (
                          <span>
                            {r.conferidos} / {r.qtdOS}
                          </span>
                        ),
                      },
                    ]}
                    summary={(pageData) => {
                      const totalQtd = pageData.reduce((acc, r: any) => acc + (r.qtdOS ?? 0), 0);
                      const totalConf = pageData.reduce((acc, r: any) => acc + (r.conferidos ?? 0), 0);
                      return (
                        <Table.Summary fixed>
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0}><strong>Total</strong></Table.Summary.Cell>
                            <Table.Summary.Cell index={1} />
                            {/* <Table.Summary.Cell index={2} align="right"><strong>{totalQtd}</strong></Table.Summary.Cell> */}
                            <Table.Summary.Cell index={3} align="right">
                              <strong>{totalConf} / {totalQtd}</strong>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        </Table.Summary>
                      );
                    }}
                  />
                </div>
              );
            })}
          </Space>

          {/* estilinho opcional para destacar concluídos */}
          <style jsx>{`
            :global(.row-done td) {
              background: #f6ffed !important;
            }
          `}</style>
        </Modal>
    </List>
  );
}
