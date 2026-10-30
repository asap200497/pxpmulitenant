"use client";

import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select , Switch, InputNumber } from "antd";
import { useCheckboxGroup } from "@refinedev/antd";



  
export default function BlogPostEdit() {
 
    
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





  const { formProps, saveButtonProps } = useForm(
 );
     const baseInitialValues = formProps?.initialValues || {};
    return (
      <Create saveButtonProps={saveButtonProps}>
        
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
                    step={0.001}
                    style={{ width: "100%" }}
                    // Format for display (e.g. R$ 1.234,56)
                    formatter={(value) =>
                        `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                    }
                    // Parse input string back into number (e.g. from R$ 1.234,56 → 1234.56)
                    parser={(value: string | undefined): number => {
                        const parsed = value?.replace(/[R$\s\.]/g, "").replace(",", ".");
                        return parseFloat(parsed || "0");
                    }}
                />

                </Form.Item>
                <Form.Item label="Padrão" name="padrao" rules={[{ required: true }]}>
                <Select>
                    <Select.Option value={1}>A1</Select.Option>
                    <Select.Option value={2}>A2</Select.Option>
                    <Select.Option value={3}>A3</Select.Option>
                    <Select.Option value={4}>A4</Select.Option>
                    <Select.Option value={5}>A5</Select.Option>
                    <Select.Option value={6}>A6</Select.Option>
                    <Select.Option value={7}>A7</Select.Option>
                    <Select.Option value={8}>A8</Select.Option>
                </Select>
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

                <Form.Item
                    label="Custos"
                    name="custos_id"
                    rules={[{ required: true }]}
                >
                    <Select
                        {...custoSelectProps}
                        placeholder="Selecione a categoria Custos"
                    />
                </Form.Item>

                <Form.Item
                    label="Markup"
                    name="markup_id"
                    rules={[{ required: true }]}
                >
                    <Select
                        {...markupSelectProps}
                        placeholder="Selecione a categoria Markup"
                    />
                </Form.Item>
            </Form>

      </Create>
    );
 }