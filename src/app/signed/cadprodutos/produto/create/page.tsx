"use client";

import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, Button, Upload, Progress, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { api } from "@/services/api";
import { getCookieClient } from "@/lib/cookieClient";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useGo, useParsed } from "@refinedev/core";

export default function ProductCreate() {

    const go = useGo();
    const { resource } = useParsed();

    const { selectProps } = useSelect({
        resource: "category",
        optionLabel: "name",
        optionValue: "id",
    });

    const { formProps, form, saveButtonProps, redirect } = useForm({
        // submitOnEnter: true,
        // redirect: false,
        // onMutationSuccess: () => {
        //     redirect("list", "products");
        // },
        // resource: "product"
    });

    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const handleCancelUpload = () => {
        abortControllerRef.current?.abort();
        setUploading(false);
        setProgress(0);
        message.warning("Upload cancelado.");
    };

    const handleSubmit = async (values: any) => {
        const formData = new FormData();
        formData.append("status","ANALISECLIENTE");
        formData.append("category_id", values.category_id);
        formData.append("name", values.name);
        formData.append("description", values.description || "");

        (values.files || []).forEach((file: any) => {
            formData.append("files", file.originFileObj);
        });

        try {
            const token = await getCookieClient();
            const controller = new AbortController();
            abortControllerRef.current = controller;
            setUploading(true);

            await api.post("/product", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                signal: controller.signal,
                onUploadProgress: (event) => {
                    const percent = Math.round((event.loaded * 100) / (event.total || 1));
                    setProgress(percent);
                },
            });

            message.success("Upload concluído com sucesso!");
            console.log(resource?.name);
            go({
                to: resource?.name ?? "/",
                type: "push", // client-side navigation
            });
            //redirect("list", "products");
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

    return (
        <Create saveButtonProps={{ ...saveButtonProps, disabled: uploading }}>
            <Form {...formProps} form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item label="Categoria" name="category_id" rules={[{ required: true }]}>
                    <Select {...selectProps} placeholder="Selecione a categoria" />
                </Form.Item>

                <Form.Item label="Nome" name="name">
                    <Input />
                </Form.Item>
                <Form.Item label="Descricao" name="description">
                  <Input.TextArea rows={4} placeholder="Digite aqui..." />
                </Form.Item>

                <Form.Item
                    label="Upload de Arquivos"
                    name="files"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                >
                    <Upload multiple beforeUpload={() => false}>
                        <Button icon={<UploadOutlined />}>Selecionar Arquivos</Button>
                    </Upload>
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
