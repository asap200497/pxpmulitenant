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
import axios from "axios";
import { saveAs } from "file-saver"; 

import { Modal } from "antd";

import { useInvalidate } from "@refinedev/core";
import { MailOutlined } from "@ant-design/icons";

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

  const handleSubir = async (id: string) => {
        const token = await getCookieClient();
        const response = await api.patch("/ticket/"+id, { status: "ANALISEINTERNA"},
            { headers: {
                Authorization: `Bearer ${token}`,
            }}
        );

        invalidate({
            resource: "ticket/status/CRIADO",
            invalidates: ["list"],
        });
  }

  const handleDownload = async (id: string) => {
        const token = await getCookieClient();
        const controller = new AbortController();
        abortControllers.current[id] = controller;
        setProgressMap((prev) => ({ ...prev, [id]: 0 }));

        try {
            await downloadFileWithProgress(
                `/ticketdownload/${id}`,
                token,
                (percent) => setProgressMap((prev) => ({ ...prev, [id]: percent })),
                controller.signal
            );
        } catch (err: any) {
            if (axios.isCancel(err)) {
                console.log(`Download for ${id} cancelled.`);
            } else {
                console.error(err);
            }
        }
        delete abortControllers.current[id];
        setProgressMap((prev) => ({ ...prev, [id]: null }));
    };
    const handleCancel = async (id: string) => {

    await abortControllers.current[id]?.abort();
    await delete abortControllers.current[id];

    // Remove key from progressMap instead of setting it to null
    await setProgressMap((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
    });

    };
    
  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="numero" title="Ticket" />
        <Table.Column
          title="Usuario"
          render={(_, record: any) => {
            return record.usuarios?.name || "–";
          }}
        />
        <Table.Column dataIndex="originalbanner" title="Arquivo" />
        <Table.Column dataIndex="descricao" title="Descricao" />
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
                                <Button onClick={() => handleDownload(id)} size="small" disabled={!!progress}>
                                    Baixar
                                </Button>
                                {progress !== null && progress !== undefined && (
                                    <>
                                        <Progress percent={progress} size="small" />
                                        <Button onClick={() => handleCancel(id)} danger size="small">
                                            Cancelar
                                        </Button>
                                    </>
                                )}
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

