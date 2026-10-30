"use client";

import {
    useTable,
    List,
    EditButton,
    ShowButton,
    DeleteButton,
    DateField,
} from "@refinedev/antd";
import { Table, Space, Form, Input } from "antd";
import { BaseRecord } from "@refinedev/core";
import { MateriaisProps } from "@/lib/materiais.type";
import { useRef } from "react";

export default function MateriaisList() {
    const { tableProps, setFilters } = useTable<MateriaisProps>({
        resource: "materiais",
        pagination: {
            pageSize: 10,
        },
        filters: {
            mode: "server",
            defaultBehavior: "merge",
        },
    });

    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            setFilters(
                value
                    ? [
                          {
                              field: "produto",
                              operator: "contains",
                              value,
                          },
                      ]
                    : [],
                "replace"
            );
        }, 400);
    };

    return (
        <List>
            <Input
                placeholder="Buscar produto"
                allowClear
                onChange={handleSearch}
                style={{ marginBottom: 16, width: 300 }}
            />

            <Table {...tableProps} rowKey="id">
                <Table.Column
                    title="No."
                    key="index"
                    render={(_, __, index) => index + 1}
                />
                <Table.Column
                    title="Empresa"
                    render={(record: BaseRecord) =>
                        record?.empresamaterial?.nomefantasia
                    }
                />
                <Table.Column dataIndex="produto" title="Produto" />
                <Table.Column dataIndex="insumo" title="Custo" />
                <Table.Column
                    title="Custo Produção"
                    render={(record: BaseRecord) =>
                        record?.custoproducao?.descricao
                    }
                />
                <Table.Column
                    title="Markup"
                    render={(record: BaseRecord) =>
                        record?.markupproducao?.descricao
                    }
                />
                <Table.Column
                    dataIndex="created_at"
                    title="Criado em"
                    render={(value: string) => <DateField value={value} />}
                />
                <Table.Column
                    title="Ações"
                    dataIndex="actions"
                    render={(_, record: BaseRecord) => (
                        <Space>
                            <EditButton
                                hideText
                                size="small"
                                recordItemId={record.id}
                            />
                            <ShowButton
                                hideText
                                size="small"
                                recordItemId={record.id}
                            />
                            <DeleteButton
                                hideText
                                size="small"
                                recordItemId={record.id}
                            />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
}
