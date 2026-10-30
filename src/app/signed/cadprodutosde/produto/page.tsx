"use client";
import { useState, useRef } from "react";
import { api } from  '@/services/api'
import { getCookieClient } from "@/lib/cookieClient"
import { CookieValueTypes } from "cookies-next";
import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
  Show
} from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Button, Space, Table, Progress} from "antd";

import { saveAs } from "file-saver"; 

import { Modal } from "antd";

import { useInvalidate } from "@refinedev/core";
import { MailOutlined } from "@ant-design/icons";

import { StatusProdutoEnum } from "@/app/constants/statusProduto"

const downloadFileWithProgress = async (
    url: string,
    token: CookieValueTypes,
    onProgress: (percent: number) => void,
     abortSignal: AbortSignal
) => {
    const response = await api.get(url, {
        responseType: "blob",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        onDownloadProgress: (event) => {
            const percent = Math.round((event.loaded * 100) / (event.total || 1));
            onProgress(percent);
        },signal: abortSignal, 
    });

    // Extract original filename from Content-Disposition
    const contentDisposition = response.headers["content-disposition"];

    let filename = "downloaded_file";
    if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+?)"?$/);
        if (match) filename = decodeURIComponent(match[1]);
    }

    saveAs(response.data, filename);
};




export default function UsuarioList() {

const [isModalVisible, setIsModalVisible] = useState(false);
const [mensagensAtivas, setMensagensAtivas] = useState<string[]>([]);

const showMensagens = (mensagens: any[]) => {
    const texts = mensagens.map((m) => (m.created_at + " - " + m.mensagem )).filter(Boolean);
    setMensagensAtivas(texts);
    setIsModalVisible(true);
};

const handleCloseModal = () => {
    setIsModalVisible(false);
    setMensagensAtivas([]);
};
  const [progressMap, setProgressMap] = useState<Record<string, number | null>>({});
  const abortControllers = useRef<Record<string, AbortController>>({});
  const { tableProps  } = useTable({ syncWithLocation: true });

const invalidate = useInvalidate();

   
  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
        title="Status"
        dataIndex="status"
        render={(value: keyof typeof StatusProdutoEnum) => {
            return StatusProdutoEnum[value] || "–";
        }}
        />


        <Table.Column
          title="Categoria"
          render={(_, record: any) => {
            return record.category?.name || "–";
          }}
        />
        <Table.Column
        title="Empresas"
        render={(_, record: any) => {
            const empresas = record.category?.empresas;
            if (!empresas || !Array.isArray(empresas)) return "–";

            const nomes = empresas
            .map((e: any) => e.empresas?.nomefantasia)
            .filter(Boolean);

            return nomes.join(", ") || "–";
        }}
        />
        <Table.Column
        title="Preço"
        dataIndex="total"
        render={(value: any) =>
            new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            }).format(parseFloat(value))
        }
        />
        <Table.Column dataIndex="name" title="Nome" />
        <Table.Column
        title="Mensagens"
        render={(_, record: any) => {
            const mensagens = record.mensagens;
            if (!mensagens || mensagens.length === 0) return "";

            return (
                    <Button
                        type="text"
                        icon={<MailOutlined />}
                        onClick={() => showMensagens(mensagens)}
                    />
            );
        }}
        />
        <Table.Column
          dataIndex={["created_at"]}
          title="Criado em"
          render={(value: any) => <DateField value={value} />}
        />
                <Table.Column
                    title="Ações"
                    dataIndex="actions"
                    render={(_, record: BaseRecord) => {
                        const id = record.id as string;
                        const progress = progressMap[id];

                        return (
                            <Space>
                                <EditButton hideText size="small" recordItemId={id} />
                                <ShowButton hideText size="small" recordItemId={id} />
                                {/* <DeleteButton hideText size="small" recordItemId={id} /> */}
                            </Space>
                        );
                    }}
                />





        
      </Table>
                <Modal
                open={isModalVisible}
                onCancel={handleCloseModal}
                footer={null}
                title="Mensagens"
                >
                <ul>
                    {mensagensAtivas.map((msg, index) => (
                    <li key={index}>{msg}</li>
                    ))}
                </ul>
                </Modal>

    </List>
  );
}

