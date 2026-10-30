"use client";

import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select , InputNumber, Switch} from "antd";

export default function BlogPostEdit() {
    const { formProps, saveButtonProps } = useForm();

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


    const baseInitialValues = formProps?.initialValues || {};

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
        </Edit>
    );
}
