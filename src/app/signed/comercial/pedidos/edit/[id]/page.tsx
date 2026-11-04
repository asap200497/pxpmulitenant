"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Edit, TextField, useForm } from "@refinedev/antd";
import { useNavigation } from "@refinedev/core";
import { Button, Form, Input, Radio, Space, Tag, Typography } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Browser } from "@capacitor/browser";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { getCookieClient } from "@/lib/cookieClient";
import { api } from "@/services/api";

const { Title } = Typography;
const ORDERS_PATH = "/signed/comercial/pedidos";

type ProductLine = {
  preco: string | number;
  quantidade: number;
  produtos: { id: string; name: string };
};

type Cotacao = {
  empresa_id: string;
  empresa: string;
  servico_id: string;
  servico: string;
  preco: string | number;
  dias: number;
};

type OrderRecord = {
  id: string;
  numero: number | string;
  status: string;
  total: number | string;
  pesoestimado: number | string;
  produtos?: ProductLine[];
};

type CheckoutValues = {
  cepdestino?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  numerodestino?: string;
  complemento?: string;
  pgto?: string;
  //frete_empresa_id?: string;
  frete_servico_id?: string;
  frete_preco?: number;
  frete_dias?: number;
  franqueado_id?: string;
  status?: string;
};

type CepResponse = { endereco?: string; cidade?: string; estado?: string };
type MakerResponse = {
  empresa?: {
    id: string;
    nomefantasia: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  cotacao?: Cotacao[];
};

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  const text = String(value).trim();
  const normalized = text.includes(",")
    ? text.replace(/\./g, "").replace(",", ".")
    : text;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

function useCieloReturn() {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let cancelled = false;
    let removeListener: (() => Promise<void>) | undefined;

    void App.addListener("appUrlOpen", async ({ url }) => {
      if (!url || cancelled) return;
      try {
        const parsed = new URL(url);
        const validHost = parsed.hostname === "printxpert.com.br";
        const validPort = parsed.port === "" || parsed.port === "8443";
        const validPath = parsed.pathname.startsWith("/signed/comercial");
        if (!validHost || !validPort || !validPath) return;
        try {
          await Browser.close();
        } catch (error) {
          console.debug("Cielo browser was already closed", error);
        }
        if (!cancelled) router.replace(ORDERS_PATH);
      } catch (error) {
        console.warn("Invalid Cielo return URL", error);
      }
    })
      .then((listener) => {
        if (cancelled) void listener.remove();
        else removeListener = () => listener.remove();
      })
      .catch((error) => console.error("Unable to register Cielo listener", error));

    return () => {
      cancelled = true;
      if (removeListener) void removeListener();
    };
  }, [router]);

  return useCallback(async (url: string) => {
    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url });
    } else {
      window.location.assign(url);
    }
  }, []);
}

export default function BlogPostEdit() {
  const router = useRouter();
  const { list } = useNavigation();
  const { formProps, form, query } = useForm();
  const record = query?.data?.data as OrderRecord | undefined;
  const recordId = record?.id;

  const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
  const [remetente, setRemetente] = useState("");
  const [selectedFrete, setSelectedFrete] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const cepRequest = useRef(0);
  const lastLookedUpCep = useRef("");
  const startCielo = useCieloReturn();

  const fretePreco = Form.useWatch("frete_preco", form) as number | undefined;
  const franqueadoId = Form.useWatch("franqueado_id", form) as string | undefined;
  const baseTotal = toNumber(record?.total);
  const grandTotal = baseTotal + toNumber(fretePreco);

  const freightOptions = useMemo(
    () => cotacoes.map((item) => ({
      key: `${item.empresa_id}:${item.servico_id}`,
      item,
    })),
    [cotacoes],
  );

  const clearFreight = useCallback(() => {
    setCotacoes([]);
    setSelectedFrete(undefined);
    setRemetente("");
    form.setFieldsValue({
      //frete_empresa_id: undefined,
      frete_servico_id: undefined,
      frete_preco: undefined,
      frete_dias: undefined,
      franqueado_id: undefined,
    });
  }, [form]);

  const selectFreight = useCallback((item: Cotacao, makerId: string) => {
    setSelectedFrete(`${item.empresa_id}:${item.servico_id}`);
    form.setFieldsValue({
   //   frete_empresa_id: item.empresa_id,
      frete_servico_id: item.servico_id,
      frete_preco: toNumber(item.preco),
      frete_dias: item.dias,
      franqueado_id: makerId,
    });
  }, [form]);

  const fetchAddressByCep = useCallback(async (rawCep: string) => {
    const cep = rawCep.replace(/\D/g, "");
    if (cep.length !== 8 || !recordId) return;
    if (cep === lastLookedUpCep.current) return;

    const requestId = ++cepRequest.current;
    setLoadingCep(true);
    clearFreight();
    form.setFieldsValue({ endereco: "", cidade: "", estado: "" });

    try {
      const token = await getCookieClient();
      const headers = { Authorization: `Bearer ${token}` };
      const address = await api.get<CepResponse>(`/correios/cep?cep=${cep}`, { headers });
      if (requestId !== cepRequest.current) return;

      if (!address.data?.endereco) {
        toast.error("CEP não encontrado");
        return;
      }
      form.setFieldsValue({
        endereco: address.data.endereco ?? "",
        cidade: address.data.cidade ?? "",
        estado: address.data.estado ?? "",
      });

      const maker = await api.get<MakerResponse>(
        `/order/findmaker?id=${encodeURIComponent(recordId)}&cep=${cep}`,
        { headers },
      );
      if (requestId !== cepRequest.current) return;

      if (!maker.data?.empresa) {
        toast.error("Fora da área de cobertura");
        lastLookedUpCep.current = cep;
        return;
      }

      const company = maker.data.empresa;
      const options = maker.data.cotacao ?? [];
      setRemetente(
        `${company.nomefantasia} ${company.cidade}/${company.estado} ${company.cep}`,
      );
      setCotacoes(options);
      form.setFieldValue("franqueado_id", company.id);
      if (options.length) selectFreight(options[0], company.id);
      else toast.error("Nenhuma opção de frete disponível");
      lastLookedUpCep.current = cep;
    } catch (error) {
      if (requestId === cepRequest.current) {
        console.error("CEP/freight lookup failed", error);
        toast.error("Não foi possível consultar o CEP ou calcular o frete");
      }
    } finally {
      if (requestId === cepRequest.current) setLoadingCep(false);
    }
  }, [recordId, form, clearFreight, selectFreight]);

  const onCepChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const cep = formatCep(event.target.value);
    if (cep.replace(/\D/g, "") !== lastLookedUpCep.current) {
      lastLookedUpCep.current = "";
      ++cepRequest.current;
      setLoadingCep(false);
      clearFreight();
      form.setFieldsValue({ endereco: "", cidade: "", estado: "" });
    }
  }, [form, clearFreight]);

  useEffect(() => {
    if (!record?.status) return;
    if (record.status !== "RASCUNHO" && record.status !== "ERRO") {
      toast.success("AGUARDE EM PROCESSAMENTO");
      router.replace(ORDERS_PATH);
    }
  }, [record?.status, router]);

  const handleUpdate = async () => {


    if (!recordId || loading || loadingCep) return;
        console.log("dsadasdas")
    try {
            console.log("calling2")
      const values = (await form.validateFields()) as CheckoutValues;
                  console.log("calling3")
      if (!values.franqueado_id || !values.frete_servico_id) {
                          console.log("calling4")
        toast.error("Selecione uma opção de frete válida");
        return;
      }
      setLoading(true);
      console.log("calling")
      const token = await getCookieClient();
      const response = await api.patch<{ linkpgto?: string }>(
        `/order/checkout/${encodeURIComponent(recordId)}`,
        {
          OrderNumber: record?.numero,
          price: grandTotal,
          products: record?.produtos,
          ...values,
          cepdestino: values.cepdestino?.replace(/\D/g, ""),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data?.linkpgto) {
        await startCielo(response.data.linkpgto);
      } else {
        list("pedidos");
      }
    } catch (error) {
      console.error("Checkout failed", error);
      toast.error("Não foi possível confirmar o pedido. Verifique os campos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Edit
      footerButtons={() => (
        <Space>
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={loading}
            disabled={!recordId || !franqueadoId || !selectedFrete || loadingCep || loading}
            onClick={() => void handleUpdate()}
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
      {record?.produtos?.map((item, index) => (
        <div key={`${item.produtos.id}-${index}`} style={{ marginBottom: 12 }}>
          <Space direction="vertical">
            <TextField value={`Produto: ${item.produtos.name}`} />
            <TextField value={`Quantidade: ${item.quantidade}`} />
            <TextField value={`Preço unitário: ${formatBRL(toNumber(item.preco))}`} />
            <TextField value={`Subtotal: ${formatBRL(item.quantidade * toNumber(item.preco))}`} />
          </Space>
        </div>
      ))}
      <Title level={5}>Peso</Title>
      <TextField value={`${(toNumber(record?.pesoestimado) / 1000).toFixed(2)} Kg`} />

      <Form {...formProps} form={form} layout="vertical">
        <Form.Item label="CEP" name="cepdestino" getValueFromEvent={(event: React.ChangeEvent<HTMLInputElement>) => formatCep(event.target.value)} rules={[{ required: true, message: "Informe o CEP" }, { pattern: /^\d{5}-?\d{3}$/, message: "CEP inválido" }]}>
          <Input
            placeholder="00000-000"
            maxLength={9}
            inputMode="numeric"
            onChange={onCepChange}
            onBlur={(event) => void fetchAddressByCep(event.currentTarget.value)}
            suffix={<span style={{ display: "inline-block", minWidth: 90, fontSize: 12 }}>{loadingCep ? "Consultando…" : ""}</span>}
          />
        </Form.Item>
        <Form.Item label="Endereço" name="endereco" rules={[{ required: true, message: "Consulte um CEP válido" }]}>
          <Input readOnly placeholder="Endereço será preenchido" />
        </Form.Item>
        <Form.Item label="Cidade" name="cidade" rules={[{ required: true }]}>
          <Input readOnly placeholder="Cidade será preenchida" />
        </Form.Item>
        <Form.Item label="Estado" name="estado" rules={[{ required: true }]}>
          <Input readOnly placeholder="Estado será preenchido" />
        </Form.Item>
        <Form.Item label="Remetente">
          <span>{remetente || "Aguardando consulta do CEP"}</span>
        </Form.Item>
        <Form.Item label="Número" name="numerodestino" rules={[{ required: true, message: "Informe o número" }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Complemento" name="complemento">
          <Input />
        </Form.Item>

        <Form.Item label="Frete" required>
          <div style={{ background: "#e6f7ff", padding: 12, borderRadius: 10, border: "1px solid #91d5ff", maxWidth: 520 }}>
            <Radio.Group
              value={selectedFrete}
              disabled={loadingCep || !franqueadoId}
              onChange={(event) => {
                const picked = freightOptions.find((option) => option.key === event.target.value);
                if (picked && franqueadoId) selectFreight(picked.item, franqueadoId);
              }}
              style={{ width: "100%" }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {freightOptions.map(({ key, item }) => (
                  <Radio key={key} value={key} style={{ width: "100%" }}>
                    <span style={{ fontWeight: 600 }}>{item.empresa} {item.servico ? `• ${item.servico}` : ""}</span>{" "}
                    <Tag color="blue">{item.dias} dia{item.dias === 1 ? "" : "s"}</Tag>{" "}
                    <strong>{formatBRL(toNumber(item.preco))}</strong>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
            {!freightOptions.length && <span>{loadingCep ? "Calculando frete…" : "Informe o CEP para calcular o frete"}</span>}
          </div>
        </Form.Item>

        <Title level={5}>Total</Title>
        <Space wrap>
          <strong>{formatBRL(baseTotal)}</strong>
          {typeof fretePreco === "number" && (
            <>
              <span>+ frete</span>
              <strong>{formatBRL(fretePreco)}</strong>
              <span>=</span>
              <strong>{formatBRL(grandTotal)}</strong>
            </>
          )}
        </Space>

        <Form.Item label="Forma de pagamento" name="pgto" rules={[{ required: true, message: "Selecione a forma de pagamento" }]} style={{ marginTop: 20 }}>
          <Radio.Group>
            <Radio value="Credito">Crédito</Radio>
            <Radio value="CIELO">Pagar Online (CIELO)</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="frete_empresa_id" hidden><Input /></Form.Item>
        <Form.Item name="frete_servico_id" hidden><Input /></Form.Item>
        <Form.Item name="frete_preco" hidden><Input /></Form.Item>
        <Form.Item name="frete_dias" hidden><Input /></Form.Item>
        <Form.Item name="status" hidden><Input /></Form.Item>
        <Form.Item name="franqueado_id" hidden><Input /></Form.Item>
      </Form>
    </Edit>
  );
}
