"use client";

import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, Button, Upload, Progress, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { api } from "@/services/api";
import { getCookieClient } from "@/lib/cookieClient";
import { useEffect, useState, useRef } from "react";

export default function TicketCreate() {


    const { formProps, form, saveButtonProps, redirect } = useForm({
        submitOnEnter: true,
        redirect: false,
        onMutationSuccess: () => {
            redirect("list", "ticket");
        },
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

        formData.append("descricao", values.descricao || "");

        (values.files || []).forEach((file: any) => {
            formData.append("files", file.originFileObj);
        });

        try {
            const token = await getCookieClient();
            const controller = new AbortController();
            abortControllerRef.current = controller;
            setUploading(true);

            await api.post("/ticket", formData, {
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
            redirect("list", "ticket");
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

                <Form.Item label="Descricao" name="descricao">
                    <Input />
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
