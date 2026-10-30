"use client";

import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Switch , Checkbox} from "antd";
import * as ReactInputMask from "react-input-mask";
const InputMask = ReactInputMask.default;
import { useList } from "@refinedev/core";

import { useSearchParams, useParams } from "next/navigation";

import { validateCPF as validateCPFHelper } from "@/lib/validatecpf";

interface IGrupos {
  id: string;
  nome: string;
}

interface ITag {
  id: number;
  nome: string;
}

export default function BlogPostCreate() {
  const { formProps, saveButtonProps } = useForm({});
    const search = useSearchParams();
   const id_empresa = search.get("id_empresa");
   console.log("ID Empresa:", id_empresa);
     const { query } = useList<ITag>({
       resource: "grupos",
       pagination: { mode: "off" },
     });
  const tagOptions =
    query.data?.data.map((tag) => ({ label: tag.nome, value: tag.id })) ?? [];

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" initialValues={{ device: false, id_empresa: id_empresa }}>
        <Form.Item label="Nome" name={["name"]} rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="Dispositivo"
          name={["device"]}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        {/* Toggle CPF ↔︎ IDDEVICE */}
        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.device !== curr.device}>
          {({ getFieldValue }) =>
            getFieldValue("device") ? (
              <Form.Item
                label="IDDEVICE"
                name="cpf"
                rules={[{ required: true, message: "Informe o ID do dispositivo" }]}
              >
                <Input placeholder="ID do dispositivo" />
              </Form.Item>
            ) : (
              <Form.Item
                label="CPF"
                name="cpf"
                rules={[
                  { required: true, message: "Informe seu CPF" },
                  {
                    validator: async (_, value) => {
                      const digits = (value || "").replace(/\D/g, "");
                      if (!digits) return Promise.reject("Informe seu CPF");
                      if (digits.length !== 11)
                        return Promise.reject("Digite os 11 dígitos do CPF");
                      if (!validateCPFHelper(digits))
                        return Promise.reject("CPF inválido");
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="00000000000"
                  inputMode="numeric"
                  maxLength={12}
                />
              </Form.Item>
            )
          }
        </Form.Item>
        <Form.Item label="Senha" name={["password"]} rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        {/* Hide Email/Telefone fields when device is true */}
        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.device !== curr.device}>
          {({ getFieldValue }) =>
            !getFieldValue("device") && (
              <>
                <Form.Item label="Email" name={["email"]} rules={[{ required: true }]}>
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Telefone1"
                  name={["telefone1"]}
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Telefone2"
                  name={["telefone2"]}
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item label="Grupos" name="grupos">
                  <Checkbox.Group
                    options={tagOptions}
                    disabled={query.isLoading}
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  />
                </Form.Item>
              </>
            )
          }
        </Form.Item>
            <Form.Item name="id_empresa" hidden>
          <Input type="hidden" />
        </Form.Item>

      </Form>
    </Create>
  );
}
