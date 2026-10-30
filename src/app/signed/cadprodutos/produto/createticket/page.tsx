"use client";

import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, Button, Upload, Progress, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { api } from "@/services/api";
import { getCookieClient } from "@/lib/cookieClient";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface MaterialOption {
  id: string;
  produto: string;
  empresamaterial: { nomefantasia: string };
}
interface CustoProducao {
  id: string;
  descricao: string;
  device: Boolean;
}

/* ==== Types for printer parameters ==== */
type PrinterOptionItem = {
  id: number;
  value: string;
  defaultvalue: boolean;
  printeroption: { option_name: string };
};
type PrinterOptionsResponse = {
  data: Record<string, PrinterOptionItem[]>;
};
type PrinterGroup = {
  groupName: string;
  selectOptions: { label: string; value: number }[];
  defaultId?: number;
};
type FormShape = {
  // existing fields
  printerOptionsMain?: Record<string, number | undefined>;
  printerOptionsCover?: Record<string, number | undefined>;
};

export default function ProductCreate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticket_id = searchParams.get("ticket");

  const { selectProps } = useSelect({
    resource: "categorybyticket",
    optionLabel: "name",
    optionValue: "id",
    filters: ticket_id
      ? [{ field: "ticked_id", operator: "eq", value: ticket_id }]
      : [],
  });

  const { formProps, form, saveButtonProps, redirect } = useForm<FormShape>({
    submitOnEnter: true,
    redirect: false,
    onMutationSuccess: () => {
      redirect("list", "products");
    },
    resource: "product",
  });

  const [progress, setProgress] = useState(0);
  const [progress2, setProgress2] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploading2, setUploading2] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleCancelUpload = () => {
    abortControllerRef.current?.abort();
    setUploading(false);
    setUploading2(false);
    setProgress(0);
    setProgress2(0);
    message.warning("Upload cancelado.");
  };

  /* ========= Printer parameters state + fetch ========= */
  const [printerGroups, setPrinterGroups] = useState<PrinterGroup[]>([]);
  const [loadingPrinterParams, setLoadingPrinterParams] = useState<boolean>(true);

  const normalizePrinterPayload = (resp: PrinterOptionsResponse): PrinterGroup[] =>
    Object.entries(resp.data).map(([groupName, items]) => ({
      groupName,
      selectOptions: items.map((it) => ({ label: it.value, value: it.id })),
      defaultId: items.find((it) => it.defaultvalue)?.id,
    }));

  useEffect(() => {
    (async () => {
      try {
        const token = await getCookieClient();
        const res = await api.get<PrinterOptionsResponse>("/parametros/impressora", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const groups = normalizePrinterPayload(res.data);
        setPrinterGroups(groups);

        // seed defaults for both sets; don't override existing touched values
        const seedMain: Record<string, number | undefined> = {};
        const seedCover: Record<string, number | undefined> = {};
        groups.forEach(({ groupName, defaultId }) => {
          const curMain = form.getFieldValue(["printerOptionsMain", groupName]) as number | undefined;
          const curCover = form.getFieldValue(["printerOptionsCover", groupName]) as number | undefined;
          seedMain[groupName] = typeof curMain === "number" ? curMain : defaultId;
          seedCover[groupName] = typeof curCover === "number" ? curCover : defaultId;
        });
        form.setFieldsValue({ printerOptionsMain: seedMain, printerOptionsCover: seedCover });
      } catch (e) {
        console.error(e);
        message.error("Failed to load printer parameters.");
      } finally {
        setLoadingPrinterParams(false);
      }
    })();
  }, [form]);
  /* ========= end printer parameters ========= */

  const handleSubmit = async (values: any) => {
    const formData = new FormData();
    formData.append("category_id", values.category_id);
    formData.append("ticket_id", ticket_id || "");
    formData.append("name", values.name);
    formData.append("description", values.description || "");

    (values.items || []).forEach((item: any, index: number) => {
      formData.append(`items[${index}][material_id]`, item.material_id);
      formData.append(`items[${index}][quantity]`, String(item.quantity));
    });

    // === DO NOT TOUCH: your Upload blocks (unchanged) ===
    (values.file || []).forEach((file: any) => {
      formData.append("files", file.originFileObj);
    });
    (values.file2 || []).forEach((file: any) => {
      formData.append("file2", file.originFileObj);
    });

    // === Add selected printer option value IDs for MAIN CONTENT
    const rawMain: Record<string, unknown> = (values as FormShape).printerOptionsMain || {};
    const mainEntries = Object.entries(rawMain).filter(
      (e): e is [string, number] => typeof e[1] === "number"
    );
    const mainMap = Object.fromEntries(mainEntries) as Record<string, number>;
    const mainIds = Object.values(mainMap);
    mainIds.forEach((id, idx) => {
      formData.append(`printer_option_value_ids_main[${idx}]`, String(id));
    });

    // === Add selected printer option value IDs for COVER (only if cover file present)
    const hasCover = Array.isArray(values.file2) && values.file2.length > 0;
    const rawCover: Record<string, unknown> = (values as FormShape).printerOptionsCover || {};
    const coverEntries = Object.entries(rawCover).filter(
      (e): e is [string, number] => typeof e[1] === "number"
    );
    const coverMap = Object.fromEntries(coverEntries) as Record<string, number>;
    const coverIds = Object.values(coverMap);
    if (hasCover) {
      coverIds.forEach((id, idx) => {
        formData.append(`printer_option_value_ids_cover[${idx}]`, String(id));
      });
    }

    try {
      const token = await getCookieClient();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setUploading(true);
      setUploading2(true);

      await api.post("/product", formData, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / (event.total || 1));
          setProgress(percent);
        },
      });

      message.success("Upload concluído com sucesso!");
      router.push("/signed/ticketrevisor/tomado");
    } catch (error: any) {
      if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
        message.warning("Upload cancelado.");
      } else {
        message.error("Falha no upload.");
        console.error(error);
      }
    } finally {
      setUploading(false);
    }
  };

  const [custoOptions, setCustoOptions] = useState<CustoProducao[]>([]);
  useEffect(() => {
    const fetchCustoOptions = async () => {
      const token = await getCookieClient();
      const res = await api.get<{ data: CustoProducao[] }>("/custosprod", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustoOptions(res.data.data);

      if (!form.getFieldValue("custos_id") && res.data.data.length > 0) {
        form.setFieldValue("custos_id", res.data.data[0].id);
      }
    };
    fetchCustoOptions();
  }, [form]);

  const [materialOptions, setMaterialOptions] = useState([]);
  const { selectProps: custoProducaoSelectProps } = useSelect<CustoProducao>({
    resource: "custosprod",
    optionLabel: "descricao",
    optionValue: "id",
  });
  useEffect(() => {
    if (
      custoProducaoSelectProps.options &&
      custoProducaoSelectProps.options.length > 0 &&
      !form.getFieldValue("custos_id")
    ) {
      form.setFieldValue("custos_id", custoProducaoSelectProps.options[0].value);
    }
  }, [custoProducaoSelectProps.options, form]);

  const fetchMaterialOptions = async (search: string = "") => {
    const token = await getCookieClient();
    const filters: any[] = [];

    if (search) {
      filters.push({ field: "produto", operator: "contains", value: search });
    }
    const selectedCustoId = form.getFieldValue("custos_id");
    if (selectedCustoId) {
      filters.push({ field: "custos_id", operator: "eq", value: selectedCustoId });
    }

    const queryString = filters
      .map(
        (f, i) =>
          `filters[${i}][field]=${f.field}&filters[${i}][operator]=${f.operator}&filters[${i}][value]=${encodeURIComponent(
            f.value
          )}`
      )
      .join("&");

    const res = await api.get(`/materiais?page=1&pageSize=10&${queryString}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setMaterialOptions(
      res.data.data.map((mat: MaterialOption) => ({
        label: mat.produto + " | " + mat.empresamaterial.nomefantasia,
        value: mat.id,
      }))
    );
  };
  useEffect(() => {
    if (selectProps.options && selectProps.options.length > 0) {
        form.setFieldsValue({
            category_id: selectProps.options[0].value,
        });
    }
  }, [selectProps.options, form]);
  // Watch cover files to toggle required rules for cover params
  const coverFiles = Form.useWatch("file2", form);
  const requireCoverParams = Array.isArray(coverFiles) && coverFiles.length > 0;

  return (
    <Create saveButtonProps={{ ...saveButtonProps, disabled: uploading }}>
      <Form {...formProps} form={form} layout="vertical" onFinish={handleSubmit}>
         <Form.Item label="Categoria" name="category_id" rules={[{ required: true }]}>
          <Select {...selectProps}  placeholder="Selecione a categoria"  />
        </Form.Item> 

        <Form.Item label="Nome" name="name">
          <Input />
        </Form.Item>

        <Form.Item label="Descricao" name="description">
          <Input.TextArea rows={4} placeholder="Digite aqui..." />
        </Form.Item>

        <Form.Item label="Filtrar por Custo de Produção" required>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {custoOptions.map((option) => {
              const isSelected = form.getFieldValue("custos_id") === option.id;
              return (
                <Button
                  key={option.id}
                  type={isSelected ? "primary" : "default"}
                  onClick={() => {
                    form.setFieldValue("custos_id", option.id);
                    setMaterialOptions([]); // clear search results
                  }}
                >
                  {option.descricao}
                </Button>
              );
            })}
          </div>
        </Form.Item>

        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block>
                  + Adicionar Material
                </Button>
              </Form.Item>

              {[...fields].reverse().map(({ key, name, ...restField }) => (
                <div key={key} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <Form.Item
                    {...restField}
                    name={[name, "material_id"]}
                    rules={[{ required: true, message: "Selecione o material" }]}
                    style={{ flex: 2 }}
                  >
                    <Select
                      placeholder="Buscar material"
                      showSearch
                      filterOption={false}
                      onSearch={(value) => fetchMaterialOptions(value)}
                      options={materialOptions}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "quantity"]}
                    rules={[{ required: true, message: "Informe a quantidade" }]}
                    style={{ flex: 1 }}
                  >
                    <Input type="number" placeholder="Quantidade" />
                  </Form.Item>
                  <Button danger onClick={() => remove(name)}>Remover</Button>
                </div>
              ))}
            </>
          )}
        </Form.List>

        {/* ====== Printer Parameters: MAIN CONTENT ====== */}
        {!loadingPrinterParams && printerGroups.length > 0 && (
          <>
            <h3 style={{ marginTop: 8 }}>Parametros Impressao Miolo</h3>
            {printerGroups.map(({ groupName, selectOptions }) => (
              <Form.Item
                key={`main-${groupName}`}
                label={groupName}
                name={["printerOptionsMain", groupName]}
                style={{ maxWidth: 480 }}
              >
                <Select
                  placeholder={`Select ${groupName}`}
                  options={selectOptions}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            ))}
          </>
        )}
        {/* ====== END Printer Parameters: MAIN CONTENT ====== */}

        {/* ====== Upload Conteúdo Principal (UNCHANGED) ====== */}
        <Form.Item label="Upload Conteúdo Principal" required>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "start" }}>
            <Form.Item
              name="file"
              valuePropName="fileList"
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
              rules={[{ required: true, message: "Selecione o arquivo do conteúdo principal" }]}
              style={{ marginBottom: 0 }}
            >
              <Upload beforeUpload={() => false} multiple>
                <Button icon={<UploadOutlined />}>Selecionar Arquivos</Button>
              </Upload>
            </Form.Item>
          </div> 
        </Form.Item>

        {/* ====== Printer Parameters: COVER (required only if cover file is provided) ====== */}
        {!loadingPrinterParams && printerGroups.length > 0 && (
          <>
            <h3 style={{ marginTop: 8 }}>Paramertros Impressao CAPA</h3>
            {printerGroups.map(({ groupName, selectOptions }) => (
              <Form.Item
                key={`cover-${groupName}`}
                label={groupName}
                name={["printerOptionsCover", groupName]}
                style={{ maxWidth: 480 }}
              >
                <Select
                  placeholder={`Select ${groupName}`}
                  options={selectOptions}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            ))}
          </>
        )}
        {/* ====== END Printer Parameters: COVER ====== */}

        {/* ====== Upload de Capa (UNCHANGED) ====== */}
        <Form.Item label="Upload de Capa (opcional)">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "start" }}>
            <Form.Item
              name="file2"
              valuePropName="fileList"
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
              style={{ marginBottom: 0 }}
            >
              <Upload beforeUpload={() => false} multiple>
                <Button icon={<UploadOutlined />}>Selecionar Arquivos</Button>
              </Upload>
            </Form.Item>
          </div>
        </Form.Item>

        {uploading && <Progress percent={progress} />}

        {uploading && (
          <Form.Item>
            <Button danger onClick={handleCancelUpload}>
              Cancelar Upload
            </Button>
          </Form.Item>
        )}
      </Form>
    </Create>
  );
}
