"use client";

import { Edit, useForm, useSelect } from "@refinedev/antd";
import {Modal,  Form, Input, Select , Button, Typography ,InputNumber, Switch} from "antd";
import { useEffect, useState } from "react";
import { getCookieClient } from "@/lib/cookieClient";
import { api } from "@/services/api";
import InputMask from "react-input-mask";

const { Text } = Typography;
export default function BlogPostEdit() {
    const [modalVisible, setModalVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    const [cnpjInput, setCnpjInput] = useState("");


    const { formProps, form, saveButtonProps } = useForm();

    const { selectProps: empresaSelectProps } = useSelect({
        resource: "empresas/related",
        optionLabel: "nomefantasia",
        optionValue: "id",
    });

    const { selectProps: custoSelectProps } = useSelect({
        resource: "custosprod",
        optionLabel: "descricao",
        optionValue: "id",
    });

    const { selectProps: markupSelectProps } = useSelect({
        resource: "markup",
        optionLabel: "descricao",
        optionValue: "id",
    });
  const fetchEmpresaByCnpj = async (cnpj: string) => {
    try {
      const token = await getCookieClient();
      const response = await api.post("/empresas/cnpj", {cnpj}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data; // { id, nomefantasia }
    } catch (err) {
      console.error("Erro ao buscar empresa:", err);
      return null;
    }
  };

  const baseInitialValues = formProps?.initialValues || {};


  const handleAddEmpresa = async (values: { cnpj: string }) => {

    const xcnpj = values.cnpj;
    
    if (!xcnpj || currentIndex === null) return;
  
    const empresa = await fetchEmpresaByCnpj(xcnpj);
    
    if (empresa) {
      const items = form.getFieldValue("precosespeciais") || [];
      items[currentIndex] = {
        ...items[currentIndex],
        empresa_id: empresa.id,
        empresa_nome: empresa.nomefantasia,
      };
      form.setFieldsValue({ items });
    }
    setModalVisible(false);
    setCnpjInput("");
    setCurrentIndex(null);
  };
  

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form
                {...formProps}
                layout="vertical"
                initialValues={{ ...baseInitialValues }}
            >
                <Form.Item
                    label="Empresa"
                    name="empresa_id"
                    rules={[{ required: true }]}
                >
                    <Select
                        {...empresaSelectProps}
                        placeholder="Selecione a Empresa dona do ativo"
                    />
                </Form.Item>

                <Form.Item
                    label="Ativo"
                    name="produto"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Valor"
                    name="insumo"
                    rules={[{ required: true }]}
                >
                <InputNumber
                    min={0}
                    step={0.000001}
                    precision={6}
                    stringMode
                    style={{ width: "100%" }}
                    formatter={(value) => {
                        if (!value) return "";
                        const number = Number(value.toString().replace(",", "."));
                        return new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                        }).format(number);
                    }}
                    parser={
                        ((value?: string) => {
                            if (!value) return "0";
                            return value
                                .replace(/\s/g, "")
                                .replace("R$", "")
                                .replace(/\./g, "")
                                .replace(",", ".")
                                .trim();
                        }) as unknown as (displayValue: string | undefined) => string | number
                    }
                />


                </Form.Item>
                <Form.Item
                    label="Deleted"
                    name="deleted"
                    rules={[{ required: false }]}
                >
                       <Switch />
                </Form.Item>
                <Form.Item
                    label="Tangivel"
                    name="tangivel"
                    rules={[{ required: false }]}
                >
                       <Switch />
                </Form.Item>
        <Text strong>PRECOS ESPECIAIS</Text>

        <Form.List name="precosespeciais">
          {(fields, { add, remove }) => (
            <>
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => {
                    const index = fields.length;
                    add();
                    setCurrentIndex(index);
                    setModalVisible(true);
                  }}
                  block
                >
                  + Adicionar Preco Especial
                </Button>
              </Form.Item>

              {[...fields].reverse().map(({ key, name, ...restField }) => (
                <div key={key} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <Form.Item
                    {...restField}
                    name={[name, "empresa_nome"]}
                    rules={[{ required: true, message: "Empresa" }]}
                    style={{ flex: 2 }}
                  >
                    <Input readOnly placeholder="Empresa será preenchida" />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "preco"]}
                    rules={[{ required: true, message: "Preço" }]}
                    style={{ flex: 1 }}
                  >
                    <InputNumber placeholder="Preço" min={0} step={0.01} style={{ width: "100%" }} />
                  </Form.Item>
                  <Button danger onClick={() => remove(name)}>Remover</Button>
                  </div>
                        ))}
                        </>
                    )}
                    </Form.List>

            </Form>

  <Modal
        open={modalVisible}
        title={`Digite o CNPJ da empresa`}
            onCancel={() => setModalVisible(false)}
            footer={null}
      >
        <Form layout="vertical" onFinish={handleAddEmpresa}>

          <Form.Item
            name="cnpj"
            label="CNPJ da Empresa"
            rules={[
              { required: true, message: "CPF é obrigatório" },
              {
                pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
                message: "Formato de CNPJ inválido",
              },
            ]}
          >
           <InputMask mask="99.999.999/9999-99" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
               Adicionar Empresa
            </Button>
          </Form.Item>
        </Form>
      </Modal>
            
        </Edit>
    );
}