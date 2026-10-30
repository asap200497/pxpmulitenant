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
import { Button, Space, Table, Form, Progress, Input} from "antd";
import axios from "axios";
import { saveAs } from "file-saver"; 
import { Modal } from "antd";
import { useInvalidate } from "@refinedev/core";

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




export default function ProductList() {


  const [modalOpen, setModalOpen] = useState(false);
  const [modalParam, setModalParam] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, number | null>>({});
  const abortControllers = useRef<Record<string, AbortController>>({});
  const { tableProps  } = useTable({ syncWithLocation: true });

const invalidate = useInvalidate();

  const handleOpenModal = (id: string) => {
    setModalParam(id);
    setModalOpen(true);
  };

  const handleDownload = async (id: string) => {
        const token = await getCookieClient();
        const controller = new AbortController();
        abortControllers.current[id] = controller;
        setProgressMap((prev) => ({ ...prev, [id]: 0 }));

        try {
            await downloadFileWithProgress(
                `/download/${id}`,
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
  const handleAttachMensagem = async (values: { mensagem : string }) => {
    const mensagem = values.mensagem?.trim();
    if (!mensagem) return;
    const token = await getCookieClient();
    try {


        await api.post("/product/mensagem", {
                     mensagem: mensagem,
                     produto_id: modalParam,
             },{
             headers: {
                 Authorization : `Bearer ${token}`
             } 
       });
        const response = await api.patch("/product/"+modalParam, { status: "CRIADO"},
            { headers: {
                Authorization: `Bearer ${token}`,
            }}
        );
        invalidate({
            resource: "product/status/ANALISEINTERNA",
            invalidates: ["list"],
        });

       setModalOpen(false);
    } catch (err) {
      console.error(err);
    
    }
  };

    
  return (
    <List>
      <Table {...tableProps} rowKey="id">


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
        <Table.Column dataIndex="originalbanner" title="Arquivo" />
        <Table.Column dataIndex="name" title="Nome" />
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
                                <Button onClick={() => handleDownload(id)} size="small" disabled={!!progress}>
                                    Baixar
                                </Button>
                                <Button onClick={() => handleOpenModal(id)} size="small" disabled={!!progress}>
                                    Rejeitar
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
           open={modalOpen}
           title={`Motivo`}
           onCancel={() => setModalOpen(false)}
           footer={null}
         >
           <Form layout="vertical" onFinish={handleAttachMensagem}>
   
             <Form.Item
               name="mensagem"
               label="Mensagem"
             >
            <Input />
             </Form.Item>
                    
             <Form.Item>
               <Button type="primary" htmlType="submit">
                 Enviar Mensagem
               </Button>
             </Form.Item>
           </Form>
         </Modal>

    </List>
  );
}
