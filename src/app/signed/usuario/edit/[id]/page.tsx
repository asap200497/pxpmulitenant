"use client";

import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Checkbox, Switch } from "antd";
import { useList } from "@refinedev/core";
import * as ReactInputMask from "react-input-mask";
const InputMask = ReactInputMask.default;

import { validateCPF as validateCPFHelper } from "@/lib/validatecpf";

interface IGruposItem {
  grupo: { id: string; nome: string };
}

interface ITag {
  id: number;
  nome: string;
}

export default function BlogPostEdit() {
  const { formProps, saveButtonProps } = useForm({});

  const { query } = useList<ITag>({
    resource: "grupos",
    pagination: { mode: "off" },
  });

  const tagOptions =
    query.data?.data.map((tag) => ({ label: tag.nome, value: tag.id })) ?? [];

  // Safely derive selected group IDs from loader data (if present)
  const baseInitialValues = formProps?.initialValues || {};
  const selectedGrupoIds: string[] =
    (formProps?.initialValues?.grupos as IGruposItem[] | undefined)?.map(
      (g) => g.grupo.id
    ) ?? [];

  // Watch the device switch

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}

        layout="vertical"
        initialValues={{
          ...baseInitialValues,
          grupos: selectedGrupoIds,
          device: baseInitialValues?.device ?? false,
        }}
      >
        {/* <Form.Item label="Login" name={["login"]}>
          <Input disabled />
        </Form.Item> */}

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
                {/*
                <InputMask mask="999.999.999-99">
                  {(p: any) => <Input {...p} size="large" placeholder="000.000.000-00" />}
                </InputMask>
                */}
              </Form.Item>
            )
          }
        </Form.Item>

        <Form.Item
          label="E-Mail"
          name={["email"]}
          rules={[{ required: true }]}
        >
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
      </Form>
    </Edit>
  );
}
