"use client";

import { Show, Edit, useForm, TextField } from "@refinedev/antd";
import { Form, Input, Radio, Tag } from "antd";
//import * as ReactInputMask from "react-input-mask";
import { IMaskInput } from "react-imask";
//const InputMask = ReactInputMask.default;
import { Typography } from "antd";
import { getCookieClient } from "@/lib/cookieClient";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation';
import { Button, Space } from "antd";
import { SendOutlined } from "@ant-design/icons";
import dataProvider from "@refinedev/simple-rest";
import { useNavigation } from "@refinedev/core";

import { Browser } from "@capacitor/browser"

import { App, type URLOpenListenerEvent } from "@capacitor/app";

import { Capacitor, type PluginListenerHandle } from "@capacitor/core";

const { Title } = Typography;

interface IProdutos {
  preco: string;
  quantidade: number;
  produtos: { id: string; name: string };
}

type Cotacao = {
  empresa_id: string;
  empresa: string;
  servico_id: string;
  servico: string;
  preco: string; // "16,71"
  dias: number;
};

const toNumber = (s: string | number | undefined | null) => {
  if (typeof s === "number") return s;
  if (!s) return 0;
  return parseFloat(String(s).replace(",", "."));
};
function useCieloReturn() {
  const router = useRouter();

  useEffect(() => {
    let sub: PluginListenerHandle | undefined;

    (async () => {
      sub = await App.addListener(
        "appUrlOpen",
        async ({ url }: URLOpenListenerEvent) => {
          try {
            console.log("[appUrlOpen] got url:", url);
            if (!url) return;

            const u = new URL(url);
            const hostOk = u.hostname === "printxpert.com.br";
            const portOk = u.port === "" || u.port === "8443";
            const pathOk = u.pathname.startsWith("/signed/comercial");

            if (hostOk && portOk && pathOk) {
              try { await Browser.close(); } catch {}
              const status = u.searchParams.get("status");
              const order  = u.searchParams.get("order");
              console.log("[appUrlOpen] matched. Navigating to pedidos…", { status, order });
              router.replace("/signed/comercial/pedidos");
            } else {
              console.log("[appUrlOpen] non-matching url, ignoring");
            }
          } catch (e) {
            console.warn("[appUrlOpen] error", e);
          }
        }
      );
    })();

    return () => { sub?.remove?.(); };
  }, [router]);

  return async (url: string) => {
    const platform = Capacitor.getPlatform();
    console.log("[Cielo] opening payment on", platform, url);
    if (platform === "android" || platform === "ios") {
      await Browser.open({ url });
    } else {
      window.location.href = url;
    }
  };
}

const fmtBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(isNaN(n) ? 0 : n);

export default function BlogPostEdit() {
  const router = useRouter();
  const { list, show, edit, create } = useNavigation();

  const safeNav = (path: string) => router.push(path.startsWith("/") ? path : `/${path}`);
  const { formProps, form, saveButtonProps, query } = useForm();
  const baseInitialValues = formProps?.initialValues || {};
  const record = query?.data?.data;

  const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
  const [endereco, setendereco] = useState("");
  const [cidade, setcidade] = useState("");
  const [estado, setestado] = useState("");
  const [remetente, setremetente] = useState("");
  const [franqueado_id, setfranqueado] = useState("");
  const [loading, setLoading] = useState<Boolean>(false);

  const startCielo =useCieloReturn()



  // Watch selected freight price to calculate grand total
  const fretePreco = Form.useWatch(["frete_preco"], form) as number | undefined;

  const baseTotal = toNumber(record?.total);
  const grandTotal = baseTotal + (fretePreco || 0);

  const cotacaoOptions = useMemo(
    () =>
      cotacoes.map((c) => ({
        value: `${c.empresa_id}:${c.servico_id}`,
        raw: c,
      })),
    [cotacoes]
  );


 const handleUpdate = async () => {
    try {
      // Do your own stuff first
    const tokenx = await getCookieClient();

    const  values = await form.validateFields() as any;

    setLoading(true);
    const data = (await api.patch("/order/checkout/" + record?.id, 
      { 
        OrderNumber: record?.numero,
        price: grandTotal,
        products: record?.produtos,
        ...values
      },
      {
        headers: { Authorization: `Bearer ${tokenx}` },
      })) as any;


     if (data.data.linkpgto != undefined) {
       await startCielo (data.data.linkpgto)
     }
     else {
      list("pedidos");
      //safeNav("/signed/comercial/pedidos");
      return (<></>);
     }
      
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  useEffect(() => {
  if (endereco) {
    form.setFieldsValue({ endereco: endereco });
    form.setFieldsValue({ cidade: cidade }); 
    form.setFieldsValue({ estado: estado });

  }
  }, [endereco, cidade, estado , form]);

  useEffect(() => {
    console.log(cotacaoOptions);
    if (cotacaoOptions.length > 0) {
      const first = cotacaoOptions[0];
      form.setFieldsValue({
        //freteopcao: first.value,
        frete_empresa_id: first.raw.empresa_id,
        frete_servico_id: first.raw.servico_id,
  //      status: "PENDENTE",
        frete_preco: toNumber(first.raw.preco),
        franqueado_id: franqueado_id,
        frete_dias: first.raw.dias,
        endereco: endereco,
      });
    } else {
      form.setFieldsValue({
        //freteopcao: undefined,
        frete_empresa_id: undefined,
        frete_servico_id: undefined,
        frete_preco: undefined,
        frete_dias: undefined,
      });
    }
  }, [cotacaoOptions, form, endereco, franqueado_id]);
    useEffect(() => {
      if (!record?.status) return;
      if (record.status !== "RASCUNHO" && record.status !== "ERRO") {
        toast.success("AGUARDE EM PROCESSAMENTO");
        router.replace("/signed/comercial/pedidos");
      }
    }, [record?.status, router]);
  
  async function fetchAddressByCep(cep: string) {
    const token = await getCookieClient();

    const data = (await api.get("/correios/cep?cep=" + cep, {
      headers: { Authorization: `Bearer ${token}` },
    })) as any;

    if (data) {
      setendereco(
        data.data?.endereco 
      );
      setcidade(
        data.data?.cidade 
      );
      setestado(
        data.data?.estado 
      );

      const datacotacoes = await api.get(
        "/order/findmaker?id=" + record?.id + "&cep=" + cep,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (datacotacoes.data.empresa) {
        setCotacoes(datacotacoes.data.cotacao as Cotacao[]);
        setfranqueado(datacotacoes.data.empresa.id);
        setremetente(
        datacotacoes.data.empresa.nomefantasia +
          " " +
          datacotacoes.data.empresa.cidade +
          "/" +
          datacotacoes.data.empresa.estado +
          " " +
          datacotacoes.data.empresa.cep
        )

      } else {
        setCotacoes([]);
        setfranqueado( "" ) ;
        setremetente("");
        toast.error("Fora da Area de Cobertura");
      } 

      if (datacotacoes.data.length) {
        setCotacoes(datacotacoes.data.cotacao as Cotacao[]);
      }  
      
    } else {
      console.warn("CEP não encontrado");
    }
  }
  return (
        <Edit
          footerButtons={() => (
            <Space>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={saveButtonProps.loading}
                disabled={franqueado_id? false: true}
                onClick={handleUpdate}
              >
              {loading ? "Processando…" : "Confirmar"}
              </Button>
            </Space>
          )}
        >
      <Title level={5}>ID</Title>
      <TextField value={record?.id} />

      <Title level={5}>Número</Title>
      <TextField value={record?.numero} />

      <Title level={5}>Produtos</Title>
      {record?.produtos?.map((item: IProdutos, index: number) => (
        <div key={index} style={{ marginBottom: 12 }}>
          <Space direction="vertical">
            <TextField value={`Produto: ${item.produtos.name}`} />
            <TextField value={`Quantidade: ${item.quantidade}`} />
            <TextField
              value={`Preço unitário: ${fmtBRL(toNumber(item.preco))}`}
            />
            <TextField
              value={`Subtotal: ${fmtBRL(
                item.quantidade * toNumber(item.preco)
              )}`}
            />
          </Space>
        </div>
      ))}

      <Title level={5}>Peso</Title>
      <TextField
        value={`${(toNumber(record?.pesoestimado) / 1000).toFixed(2)} Kg`}
      />

      <Form {...formProps} layout="vertical" initialValues={{ ...baseInitialValues }  }>
      <Form.Item
        label="CEP"
        name="cep"
      >
        <IMaskInput
          mask="00000-000"
          placeholder="00000-000"
          onBlur={(e) => {
            const cep = e.currentTarget.value.replace(/\D/g, "");

            if (cep.length === 8) {
              console.log("Consultar CEP:", cep);
              // Your existing CEP lookup logic
            }
          }}
          style={{
            width: "100%",
            padding: "4px 11px",
            border: "1px solid #d9d9d9",
            borderRadius: 6,
            fontSize: 14,
          }}
        />
      </Form.Item>

        <Form.Item label={"Endereco"} name={["endereco"]} >
              <Input readOnly placeholder="Endereco sera preenchido" />
        </Form.Item>
        <Form.Item label={"cidade"} name={["cidade"]} >
              <Input readOnly placeholder="Endereco sera preenchido" />
        </Form.Item>
        <Form.Item label={"estado"} name={["estado"]} >
              <Input readOnly placeholder="Endereco sera preenchido" />
        </Form.Item>


        <Form.Item label={"Remetente"} name={["remetente"]} >
          <span>{remetente}</span>
        </Form.Item>

        <Form.Item label={"Numero"} name={["numerodestino"]}
                  rules={[{ required: true }, ]}>
          <Input />
        </Form.Item>

        <Form.Item label={"Complemento"} name={["complemento"]}>
          <Input />
        </Form.Item>


        {/* --- Frete - “prettier” list --- */}
        <Form.Item
          label="Frete"
//          name={["freteopcao"]}
          rules={[{ required: true, message: "Selecione um frete" }]}
        >
          <div
            style={{
              background: "#e6f7ff",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #91d5ff",
              maxWidth: 520,
            }}
          >
            <Radio.Group
              style={{ width: "100%" }}
              onChange={(e) => {
                const picked = cotacoes.find(
                  (c) => `${c.empresa_id}:${c.servico_id}` === e.target.value
                );
                if (picked) {
                  form.setFieldsValue({
                    frete_empresa_id: picked.empresa_id,
                    frete_servico_id: picked.servico_id,
                    frete_preco: toNumber(picked.preco),
                    frete_dias: picked.dias,
                  });
                }
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {cotacoes.map((c) => {
                  const value = `${c.empresa_id}:${c.servico_id}`;
                  const price = fmtBRL(toNumber(c.preco));
                  return (
                    <Radio value={value} key={value} style={{ display: "block" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: "1px solid #d9f0ff",
                          background: "#ffffff",
                          transition: "all .15s ease-in-out",
                        }}
                        className="frete-row"
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 600 }}>
                            {c.empresa} {c.servico ? `• ${c.servico}` : ""}
                          </span>
                          <Tag color="blue" style={{ marginLeft: 4 }}>
                            {c.dias} dia{c.dias === 1 ? "" : "s"}
                          </Tag>
                        </div>
                        <strong style={{ fontSize: 16 }}>{price}</strong>
                      </div>
                    </Radio>
                  );
                })}
              </div>
            </Radio.Group>
          </div>
        </Form.Item>

      {/* Total prettier + dynamic grand total */}
      <Title level={5} style={{ marginBottom: 4 }}>
        Total
      </Title>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "baseline",
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontWeight: 600 }}>{fmtBRL(baseTotal)}</span>
        {typeof fretePreco === "number" && !isNaN(fretePreco) && (
          <>
            <span style={{ opacity: 0.75 }}>+ frete</span>
            <span style={{ fontWeight: 600 }}>{fmtBRL(fretePreco)}</span>
            <span style={{ opacity: 0.75 }}>=</span>
            <span
              style={{
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 6,
                background: "#f6ffed",
                border: "1px solid #b7eb8f",
              }}
              title="Total com frete"
            >
              {fmtBRL(grandTotal)}
            </span>
          </>
        )}
      </div>
        <Form.Item label={"Forma Pagamento"} name={["pgto"] } rules={[{ required: true }]} >
            <Radio.Group
              style={{ width: "100%" }}
            >
              <Radio value="Credito">Credito</Radio>  
              <Radio value="CIELO">Pagar Online (CIELO)</Radio>  
              
            </Radio.Group>
        </Form.Item>


        {/* Hidden fields for submission */}
        {/* <Form.Item name={["frete_empresa_id"]} hidden>
          <Input />
        </Form.Item> */}
        
        <Form.Item name={["frete_servico_id"]} hidden>
          <Input />
        </Form.Item>
        <Form.Item name={["frete_preco"]} hidden>
          <Input />
        </Form.Item>
        <Form.Item name={["frete_dias"]} hidden>
          <Input />
        </Form.Item>
        <Form.Item name={["status"]} hidden>
          <Input />
        </Form.Item>
        <Form.Item name={["franqueado_id"]} hidden>
          <Input />
        </Form.Item>
      </Form>

      {/* Quick hint for hover/selected feel (optional): */}
      <style jsx>{`
        :global(.frete-row:hover) {
          border-color: #69b1ff;
          box-shadow: 0 2px 10px rgba(105, 177, 255, 0.2);
        }
        :global(.ant-radio-wrapper-checked .frete-row) {
          border-color: #1677ff;
          box-shadow: 0 2px 12px rgba(22, 119, 255, 0.25);
        }
      `}</style>
    </Edit>
  );
}