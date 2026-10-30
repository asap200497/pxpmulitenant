"use client";

import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, DatePicker, Select, InputNumber, Button } from "antd";
import { FormListFieldData } from "antd/es/form";
import dayjs from "dayjs";
import { Typography , Space} from "antd";
const { Text, Title } = Typography;
import { useSelect } from "@refinedev/core";

type Empresa = { id: string | number; nomefantasia: string };
type Materiais = { id: string | number; produto: string };


export default function BlogPostEdit() {
  const { formProps, saveButtonProps  } = useForm({
    meta: {
      initialValues: (data: any) => ({
        ...data,
        vencimento: data.vencimento ? dayjs(data.vencimento) : null,
        items: data.items?.map((item: any) => ({
          ...item,
          material_id: item.material_id,
          preco: parseFloat(item.preco),
        })),
      }),
    },
  });

  const {
    options: empresaOptions,
    query: empresaQuery,
    onSearch: onSearchEmpresa, // para server-side search
  } = useSelect<Empresa>({
    resource: "empresas",
    optionLabel: "nomefantasia",
    optionValue: "id",
    // pagination: { mode: "off" }, // opcional: carrega tudo
  });

  const {
    options: materiaisOptions,
    query: materiaisQuery,
    onSearch: onSearchMaterial, // para server-side search
  } = useSelect<Materiais>({
    resource: "materiais",
    optionLabel: "produto",
    optionValue: "id",
    // pagination: { mode: "off" }, // opcional: carrega tudo
  });


  // const { selectProps: materialSelectProps } = useSelect({
  //   resource: "materiais",
  //   optionLabel: "produto",
  //   optionValue: "id",
  // });

 
  const empresaNome = formProps?.initialValues?.empresa?.nomefantasia;

  return (
    <Edit saveButtonProps={saveButtonProps}>
              {/* Show fixed empresa.nomefantasia */}

      <Form.Item label="Empresa">
        <Title level={4} style={{ margin: 0 }}>
          {empresaNome || "—"}
        </Title>
      </Form.Item>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Descrição"
          name="descricao"
          rules={[{ required: true, message: "Obrigatório" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Vencimento"
          name="vencimento"
          getValueProps={(value) => ({
            value: value ? dayjs(value) : null,
          })}
          rules={[{ required: true, message: "Obrigatório" }]}
        >
          <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
        </Form.Item>

        <Form.List name="items">
          {(fields) => (
            <>
              {fields.map((field: FormListFieldData) => (
                <div
                  key={field.key}
                  style={{
                    marginBottom: 16,
                    border: "1px solid #ccc",
                    padding: 16,
                    borderRadius: 8,
                  }}
                >
                <Space direction="vertical" size={2}>
                  <Text style={{ fontSize: 16, fontWeight: 500 }}>Material</Text>
                  <Text strong style={{ fontSize: 16 }}>
                    {formProps.form?.getFieldValue(["items", field.name, "produto"])}
                  </Text>
                </Space>
                  <Form.Item
                    label="Preço"
                    name={[field.name, "preco"]}
                    rules={[{ required: true, message: "Obrigatório" }]}
                  >
                    <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
                  </Form.Item>
                </div>
              ))}

            </>
          )}
        </Form.List>
      </Form>
    </Edit>
  );
}
