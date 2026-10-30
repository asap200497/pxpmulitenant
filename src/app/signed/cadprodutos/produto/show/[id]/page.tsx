"use client";

import { Show } from "@refinedev/antd";
import { Typography, Descriptions, Divider, Table } from "antd";
import { useShow } from "@refinedev/core";
import { useEffect, useState, useRef } from "react";

import * as pdfjsLib from 'pdfjs-dist';
import { getCookieClient } from "@/lib/cookieClient";

import dynamic from "next/dynamic";

import { Card } from "antd"

//pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

const PdfViewer = dynamic(() => import("./PdfViewer"), {
    ssr: false,
});


interface MaterialItem {
    quantity: number;
            preco: string;
    material: {
        produto: string;
        insumo: string;
        custoproducao: {
            valor: string;
        };
        markupproducao: {
            valor: string;
        };
    };
}

const { Title } = Typography;


  
export default function ProductShow() {
    const { query } = useShow();
    const { data, isLoading } = query;

    const record = data?.data;

    const items = (record?.items ?? []).filter((i: any) => i?.material);

    // Calculate total cost
      const totalCost = items.reduce((sum: number, item: MaterialItem) => {
        const qtd = Number(item.quantity || 0);
        const markup = Number(item.preco || 1);
        return      sum + (qtd * markup);
    }, 0);

return (
    <Show isLoading={isLoading}>
        <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
            <Descriptions
                title="Detalhes do Produto"
                bordered
                column={1}
                style={{ flex: 1 }}
            >
                <Descriptions.Item label="Status">{record?.status}</Descriptions.Item>
                <Descriptions.Item label="Nome">{record?.name}</Descriptions.Item>
                <Descriptions.Item label="Descrição">{record?.description || "-"}</Descriptions.Item>
                <Descriptions.Item label="Arquivo">{record?.originalbanner}</Descriptions.Item>
                <Descriptions.Item label="Categoria">{record?.category?.name}</Descriptions.Item>
                <Descriptions.Item label="Peso">{(Number(record?.peso)/1000).toFixed(3)} Kg</Descriptions.Item>
                <Descriptions.Item label="Empresa">
                    {record?.category?.empresas?.[0]?.empresas?.nomefantasia}
                </Descriptions.Item>
            </Descriptions>

            <div style={{ flex: 1.5, minWidth: "200px", maxWidth: "100%", maxHeight: "90vh", overflow: "auto" }}>
                <PdfViewer url={record?.banner} />
            </div>
        </div>

        <Card title="Items do Produto" size="small" bordered style={{ marginTop: 24 }}>
    <Table
        dataSource={record?.items || []}
        rowKey={(record: any, index: number | undefined) => `${index ?? record.id ?? Math.random()}`}
        pagination={false}
        size="small"
        summary={() => (
            <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={5}>
                    <div style={{ textAlign: "right", fontWeight: "bold" }}>
                        Total Geral
                    </div>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                    <div style={{ fontWeight: "bold" }}>
                        R$ {record?.total}
                    </div>
                </Table.Summary.Cell>
            </Table.Summary.Row>
        )}
    >
        <Table.Column title="Material" dataIndex={["material", "produto"]} key="produto" />
        <Table.Column title="Empresa" render={(_, record: any) => record.material.empresamaterial?.nomefantasia} />
        <Table.Column title="Qtd" dataIndex="quantity" key="quantity" align="center" />
        <Table.Column title="Preço" render={(_, record: any) => Number(record.preco).toFixed(4)} align="right" />
        <Table.Column
            title="Valor Total"
            render={(_, record: any) => {
                const qtd = parseFloat(record.quantity);
                const preco = parseFloat(record.preco);
                return (qtd * preco).toFixed(2);
            }}
            align="right"
        />
    </Table>
</Card>

<Card title="Preco para filiais" size="small" bordered style={{ marginTop: 24 }}>
    <Table
        dataSource={record?.prices || []}
        rowKey={(record: any, index: number | undefined) => `${index ?? record.id ?? Math.random()}`}
        pagination={false}
        size="small"
    >
        <Table.Column title="Nível" dataIndex="nivel" key="nivel" align="center" />
        <Table.Column title="Preço" render={(_, record: any) => `R$ ${Number(record.price).toFixed(2)}`} align="right" />
    </Table>
</Card>
<Card title="Preco para INTERNET" size="small" bordered style={{ marginTop: 24 }}>
            <Typography  >
            R${record?.precointernet}
            </Typography>
</Card>

</Show>
    );
}