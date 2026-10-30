"use client";

import { useEffect, useRef, useState } from "react";
import { Edit, useForm , useSelect} from "@refinedev/antd";
import { useParsed } from "@refinedev/core";
import { Form, Input, Select, Typography, message, Space } from "antd";
import type { FormInstance } from "antd/es/form";
import { api } from "@/services/api";
import { getCookieClient } from "@/lib/cookieClient";

const { Title } = Typography;

/* ============ Types ============ */
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
type ProductOption = { printeroption: { id: number; value: string } };

type FormShape = {
  name?: string;
  description?: string;
  ticket_id? : string;

  // we’ll use nested objects at UI-level:
  // { [groupName]: number }
  printerOptionsMain?: Record<string, number | undefined>;
  printerOptionsCover?: Record<string, number | undefined>;

  // backend also gives us:
  options?: ProductOption[]; // used only for seeding
};

/* ============ Helpers ============ */

// Normalize /parametros/impressora -> groups and reverse index
function normalizePrinterPayload(resp: PrinterOptionsResponse) {
  const groups: PrinterGroup[] = [];
  const idToGroup = new Map<number, string>();

  for (const [groupName, items] of Object.entries(resp.data)) {
    const selectOptions = items.map((it) => {
      idToGroup.set(Number(it.id), groupName);
      return { label: it.value, value: Number(it.id) };
    });
    const defaultId = items.find((it) => it.defaultvalue)?.id;
    groups.push({ groupName, selectOptions, defaultId });
  }

  return { groups, idToGroup };
}

// Turn an object map {groupName: id} into number[]
const toNumArray = (obj?: Record<string, number | undefined>) =>
  Object.values(obj ?? {}).filter(
    (v): v is number => typeof v === "number" && Number.isFinite(v)
  );

/* ============ Page ============ */

export default function ProductEdit() {
  const { id: productId  } = useParsed();
  




  const { formProps, saveButtonProps, formLoading } = useForm<FormShape>({
    resource: "product",
    id: productId,
    action: "edit",
  });

  const form = formProps.form as FormInstance<FormShape>;
  const ticket_id = form.getFieldValue("ticket_id");
  const { selectProps } = useSelect({
    resource: "categorybyticket",
    optionLabel: "name",
    optionValue: "id",
    filters: ticket_id
      ? [{ field: "ticked_id", operator: "eq", value: ticket_id }]
      : [],
  });

  const [printerGroups, setPrinterGroups] = useState<PrinterGroup[]>([]);
  const [idToGroup, setIdToGroup] = useState<Map<number, string>>(new Map());
  const [loadingPrinterParams, setLoadingPrinterParams] = useState(true);
  const seededRef = useRef(false);

  // 1) Fetch printer parameters (groups + reverse index)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getCookieClient();
        const res = await api.get<PrinterOptionsResponse>("/parametros/impressora", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;
        const { groups, idToGroup } = normalizePrinterPayload(res.data);
        setPrinterGroups(groups);
        setIdToGroup(idToGroup);
      } catch (e) {
        console.error(e);
        message.error("Falha ao carregar parâmetros de impressora.");
      } finally {
        if (!cancelled) setLoadingPrinterParams(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 2) Seed selects once product + groups are ready
  const groupsReady = !loadingPrinterParams && printerGroups.length > 0;
  const productLoaded =
    typeof formLoading === "boolean" ? !formLoading : !!formProps.initialValues;

  useEffect(() => {
    if (!form || !groupsReady || !productLoaded || seededRef.current) return;

    // Build {groupName: id} by using product.options[].printeroption.id
    const initial = (formProps.initialValues ?? {}) as FormShape;
    const productOptIds = (initial.options ?? []).map((o) => Number(o.printeroption.id));

    const fromProduct: Record<string, number> = {};
    for (const optId of productOptIds) {
      const g = idToGroup.get(optId);
      if (g) fromProduct[g] = optId;
    }

    // Seed main/cover = product values; where missing, fallback to group default
    const seedMain: Record<string, number | undefined> = {};
    const seedCover: Record<string, number | undefined> = {};

    for (const { groupName, defaultId } of printerGroups) {
      const curMain = form.getFieldValue(["printerOptionsMain", groupName]) as unknown;
      const curCover = form.getFieldValue(["printerOptionsCover", groupName]) as unknown;

      const curMainNum = typeof curMain === "number" ? curMain : undefined;
      const curCoverNum = typeof curCover === "number" ? curCover : undefined;

      seedMain[groupName] = fromProduct[groupName] ?? curMainNum ?? defaultId;
      seedCover[groupName] = fromProduct[groupName] ?? curCoverNum ?? defaultId;
    }

    form.setFieldsValue({
      printerOptionsMain: seedMain,
      printerOptionsCover: seedCover,
    });

    seededRef.current = true;
  }, [form, formProps.initialValues, groupsReady, productLoaded, printerGroups, idToGroup, formLoading]);

  // 3) Transform to arrays of IDs before submit
  const transformForBackend = (values: FormShape) => ({
    ...values,
    printerOptionsMain: toNumArray(values.printerOptionsMain),
    printerOptionsCover: toNumArray(values.printerOptionsCover),
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        onFinish={(vals) => formProps.onFinish?.(transformForBackend(vals as FormShape))}
        style={{ maxWidth: 840, margin: "0 auto" }}
      >
        <Title level={4} style={{ marginTop: 0 }}>
          Editar Produto
        </Title>
        <Form.Item label="Categoria" name="category_id" rules={[{ required: true }]}>
          <Select {...selectProps} placeholder="Selecione a categoria" />
        </Form.Item>

        <Form.Item label="Nome" name="name" rules={[{ required: true }]}>
          <Input placeholder="Nome do produto" />
        </Form.Item>

        <Form.Item label="Descrição" name="description">
          <Input.TextArea rows={3} placeholder="Descrição" />
        </Form.Item>

        {/* Printer Parameters — Miolo */}
        {!loadingPrinterParams && printerGroups.length > 0 && (
          <>
            <Title level={5} style={{ marginTop: 8 }}>
              Parâmetros da Impressão — Miolo
            </Title>
            <Space direction="vertical" style={{ width: "100%" }}>
              {printerGroups.map(({ groupName, selectOptions }) => (
                <Form.Item
                  key={`main-${groupName}`}
                  label={groupName}
                  name={["printerOptionsMain", groupName]}
                  style={{ marginBottom: 8, maxWidth: 520 }}
                >
                  <Select options={selectOptions} showSearch optionFilterProp="label" />
                </Form.Item>
              ))}
            </Space>
          </>
        )}

        {/* Printer Parameters — Capa */}
        {!loadingPrinterParams && printerGroups.length > 0 && (
          <>
            <Title level={5} style={{ marginTop: 12 }}>
              Parâmetros da Impressão — Capa
            </Title>
            <Space direction="vertical" style={{ width: "100%" }}>
              {printerGroups.map(({ groupName, selectOptions }) => (
                <Form.Item
                  key={`cover-${groupName}`}
                  label={groupName}
                  name={["printerOptionsCover", groupName]}
                  style={{ marginBottom: 8, maxWidth: 520 }}
                >
                  <Select options={selectOptions} showSearch optionFilterProp="label" />
                </Form.Item>
              ))}
            </Space>
          </>
        )}
      </Form>
    </Edit>
  );
}
