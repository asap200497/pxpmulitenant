"use client";

import { Edit, useForm } from "@refinedev/antd";
import { Button, Form, Switch, Space, Typography, Input } from "antd";
import { useEffect, useMemo, useState } from "react";
import { SendOutlined } from "@ant-design/icons";
import { api } from "@/services/api";
import { getCookieClient } from "@/lib/cookieClient";
import { PrinterDriverOptionsTable ,    } from "./PrinterDriverOptionsTable"; // adjust path
import { useRouter } from "next/navigation";
import { useGo, useParsed } from "@refinedev/core";

const { Title } = Typography;

type Choice = string;
type OptionDef = { choices: Choice[]; default: Choice; description: string };
type OptionsMap = Record<string, OptionDef>;

export type PrinterPayload = {
  id: string;
  name: string;
  enabled: boolean;
  options: OptionsMap;
  franqueado?: { id: string; nomefantasia: string; cidade: string; estado: string };
  impressoravalues?: Array<{
    id: number;
    value_id: number;
    value: string; // e.g. "Duplex=DuplexNoTumble"
    printervalue: {
      printeroption: { id: number; option_name: string };
      value: string;
      id: number;
      defaultvalue: boolean;
    };
  }>;
};

export default function BlogPostEdit() {
  const { formProps, form, saveButtonProps } = useForm({
    meta: { initialValues: (data: PrinterPayload) => ({ ...data }) },
  });
  const { resource } = useParsed();           // <- current resource (e.g., "impressoras")
  const go = useGo();                         // <- Refine navigation helper
  const router = useRouter();  
  const impresx = formProps.initialValues as PrinterPayload;
  const empresaNome = impresx?.franqueado?.nomefantasia;

  // Table selections map: { "<optName>:<value_id>": "DriverOpt=Choice" }
  const [driverSelections, setDriverSelections] = useState<Record<string, string | undefined>>({});

  // Preload from impressoravalues on first load
  useEffect(() => {
    const iv = impresx?.impressoravalues;
    
    if (!iv?.length) return;
    const map: Record<string, string> = {};
    for (const r of iv) {
      const rowKey = `${r.printervalue.printeroption.option_name}:${r.value_id}`;
      // saved value already in "DriverOpt=Choice" format—use as-is
      if (r.value) map[rowKey] = r.value;
    }
    setDriverSelections(map);
    
    
  }, [impresx]);

  const handleUpdate = async () => {
    try {
      const tokenx = await getCookieClient();
      const values = (await form.validateFields()) as any;
      

      const selectionsArray = Object.entries(driverSelections).map(([rowKey, raw]) => {
        const parts = rowKey.split(":");
        const idStr = parts[parts.length - 1];
        const id = Number(idStr);

        const value = raw && raw.length ? raw : null;

        // Optional split for server-side convenience ("Opt=Choice")
        let driverOption: string | null = null;
        let choice: string | null = null;
        if (value) {
          const eq = value.split("=");
          driverOption = eq[0] ?? null;
          choice = eq[1] ?? null;
        }

        return { id, raw: value, driverOption, choice };
      });

      const flatSelections = selectionsArray.map(({ id, raw }) => ({ id, selection: raw }));

      const resp = await api.post(
        `/parametros/impressora/${impresx.id}`,
        {
          ...values,
          options: flatSelections, // [{ id, selection: "Opt=Choice" | null }]
        },
        { headers: { Authorization: `Bearer ${tokenx}` } }
      );
      try { window.close(); } catch { /* ignore */ }

      if (resource?.name) {
        go({ to: { resource: resource.name, action: "list" } });
      } else {
        // fallback if resource couldn't be resolved
        router.push("/signed");
      }
      
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  return (
    <Edit
      saveButtonProps={saveButtonProps}
      // footerButtons={() => (
      //   <Space>
      //      <Button
      //       type="primary"
      //       icon={<SendOutlined />}
      //       loading={saveButtonProps.loading}
      //       onClick={handleUpdate}
      //     >
      //       Confirmar
      //     </Button> 
      //   </Space>
      // )}
    >


      <Form {...formProps} layout="vertical" onFinish={handleUpdate}>
      <Form.Item label="Empresa">
        <Title level={4} style={{ margin: 0 }}>
          {empresaNome || "—"}
        </Title>
      </Form.Item>        
        <Title level={4} style={{ margin: 0 }}>
          {impresx?.name || "—"}
        </Title>
        <br ></br>
        <Form.Item
          label="Nome Curto"
          name="shortname"
          rules={[{ required: true, message: "Obrigatório" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Ativa"
          name="enabled"
          rules={[{ required: true, message: "Obrigatório" }]}
        >
          <Switch />
        </Form.Item>
        <Form.Item
          label="Raw"
          name="raw"
          rules={[{ required: true, message: "Obrigatório" }]}
        >
          <Switch />
        </Form.Item>

        <Form.Item>
<PrinterDriverOptionsTable
  driverOptions={impresx?.options}
  defaultSelections={driverSelections}        // OK to pass {} when DB empty
  onSelectionChange={(map) => {
    setDriverSelections(map);
  }}
/>
        </Form.Item>
      </Form>
    </Edit>
  );
}
