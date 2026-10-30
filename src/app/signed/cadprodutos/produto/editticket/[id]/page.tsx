"use client";

import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, Button, InputNumber, Progress, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { api } from "@/services/api";
import { getCookieClient } from "@/lib/cookieClient";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from 'next/navigation'
import { useParams } from "next/navigation";

interface MaterialOption {
    id: string;
    produto: string;
    empresamaterial: {
        nomefantasia: string;
    }
    // Add more fields if needed (e.g., unit, code, etc.)
}
interface CustoProducao {
    id: string;
    descricao: string;
}
export default function ProductEdit() {
    const router =  useRouter();
     const params = useParams();
    const searchParams = useSearchParams();
    const ticket_id = searchParams.get("ticket");
    const rawId = params?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { selectProps } = useSelect({
        resource: "categorybyticket",
        optionLabel: "name",
        optionValue: "id",
        filters: ticket_id
            ? [{
                field: "ticked_id",
                operator: "eq",
                value: ticket_id,
            }]
            : [],
    });

     const { formProps, form, saveButtonProps, redirect } = useForm({
        resource: "product",
        id, // <-- 👈 required for Edit to work
        action: "edit", // optional, but makes intent clear
        submitOnEnter: true,
        redirect: false,
        onMutationSuccess: () => {
            redirect("list", "products");
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
            const normalizedItems = values.items.map((item: any) => ({
                ...item,
                material_id: item.material_id || item.material?.value, // fallback
            }));

            const token = await getCookieClient();
            await api.patch(`/product/${id}`, { ...values, items: normalizedItems }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            router.push("/signed/ticketrevisor/tomado")
    };

    const [custoOptions, setCustoOptions] = useState<CustoProducao[]>([]);

    useEffect(() => {
        const fetchCustoOptions = async () => {
            const token = await getCookieClient();
            const res = await api.get<{ data: CustoProducao[] }>("/custosprod", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCustoOptions(res.data.data);

            // Set default if not selected
            if (!form.getFieldValue("custos_id") && res.data.data.length > 0) {
                form.setFieldValue("custos_id", res.data.data[0].id);
            }
        };

        fetchCustoOptions();
    }, [form]);

    const [materialOptions, setMaterialOptions] = useState([]);
    const [custoProducaoId, setCustoProducaoId] = useState<string>();

        const { selectProps: custoProducaoSelectProps } = useSelect<CustoProducao>({
            resource: "custosprod",
            optionLabel: "descricao",
            optionValue: "id",

        });
        useEffect(() => {
            if (
                custoProducaoSelectProps.options &&
                custoProducaoSelectProps.options.length > 0 &&
                !form.getFieldValue("custos_id")
            ) {
                form.setFieldValue("custos_id", custoProducaoSelectProps.options[0].value);
            }
        }, [custoProducaoSelectProps.options, form]);

        const fetchMaterialOptions = async (search: string = "") => {
            const token = await getCookieClient();
            const filters: any[] = [];

            if (search) {
                filters.push({
                    field: "produto",
                    operator: "contains",
                    value: search,
                });
            }
            const selectedCustoId = form.getFieldValue("custos_id"); // ✅ read from form
            if (selectedCustoId) {
                filters.push({
                    field: "custos_id",
                    operator: "eq",
                    value: selectedCustoId,
                });
            }

            const queryString = filters
                .map((f, i) => `filters[${i}][field]=${f.field}&filters[${i}][operator]=${f.operator}&filters[${i}][value]=${encodeURIComponent(f.value)}`)
                .join("&");

            const res = await api.get(`/materiais?page=1&pageSize=10&${queryString}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setMaterialOptions(
                res.data.data.map((mat: MaterialOption) => ({
                    label: mat.produto + " | " + mat.empresamaterial.nomefantasia,
                    value: mat.id,
                }))
            );
        };

        useEffect(() => {
            const initial = formProps.initialValues;
            if (!initial || !initial.items) return;

            const transformed = initial.items.map((item: any) => ({
                ...item,
                material_id: item.material?.id,
                material: {
                    value: item.material?.id,
                    label: item.material?.produto + " | " +  item.material.empresamaterial?.nomefantasia,
                },
            }));

            form.setFieldsValue({
                ...initial,
                items: transformed,
            });
        }, [formProps.initialValues, form]);


    return (
    
        <Edit saveButtonProps={{ ...saveButtonProps, disabled: uploading }}>
            <Form {...formProps} form={form} layout="vertical" onFinish={handleSubmit} >
                <Form.Item label="Categoria" name="category_id" rules={[{ required: true }]}>
                    <Select {...selectProps} placeholder="Selecione a categoria" />
                </Form.Item>

                <Form.Item label="Nome" name="name">
                    <Input />
                </Form.Item>
                <Form.Item label="Descricao" name="description">
                      <Input.TextArea rows={4} placeholder="Digite aqui..." />
                </Form.Item>
                    <Form.Item label="Filtrar por Custo de Produção" required>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            {custoOptions.map((option) => {
                                const isSelected = form.getFieldValue("custos_id") === option.id;
                                return (
                                    <Button
                                        key={option.id}
                                        type={isSelected ? "primary" : "default"}
                                        onClick={() => {
                                            form.setFieldValue("custos_id", option.id);
                                            setMaterialOptions([]); // clear search results
                                        }}
                                    >
                                        {option.descricao}
                                    </Button>
                                );
                            })}
                        </div>
                    </Form.Item>
 
                    <Form.List name="items">
                        {(fields, { add, remove }) => (
                            <>
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block>
                                        + Adicionar Material
                                    </Button>
                                </Form.Item>

                                {[...fields].reverse().map(({ key, name, ...restField }) => ( 
                                    <div key={key} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, "material"]}
                                            rules={[{ required: true, message: "Selecione o material" }]}
                                            style={{ flex: 2 }}
                                        >
                                            <Select
                                                placeholder="Buscar material"
                                                showSearch
                                                labelInValue
                                                filterOption={false}
                                                onSearch={(value) => {
                                                    fetchMaterialOptions(value);
                                                }}
                                                options={materialOptions}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, "quantity"]}
                                            rules={[{ required: true, message: "Informe a quantidade" }]}
                                            style={{ flex: 1 }}
                                        >
                                            <InputNumber type="number" placeholder="Quantidade" />
                                        </Form.Item>
                                        <Button danger onClick={() => remove(name)}>Remover</Button>
                                    </div>
                                ))}
                            </>
                        )}
                    </Form.List>


            </Form>
        </Edit>
    );
}
