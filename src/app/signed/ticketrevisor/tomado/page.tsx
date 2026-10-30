"use client";
import { useState, useEffect ,useRef } from "react";
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
import { Button, Space, Table, Table as AntTable2 , Progress} from "antd";
import axios from "axios";
import { saveAs } from "file-saver"; 

import { Form, Input, Modal } from "antd";
import { useRouter } from 'next/navigation'
import { useInvalidate } from "@refinedev/core";
import { MailOutlined } from "@ant-design/icons";
import { useGo } from "@refinedev/core";
import { EditOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigation } from "@refinedev/core";

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

import { Table as AntTable } from "antd"; // Rename to avoid conflict with your main Table

const expandedRowRender = (record: any) => {
    const columns = [
        {
            title: "Nome do Produto",
            dataIndex: "name",
            key: "name",
            render: (text: string, produto: any) => (
                <a
                    href={`/signed/cadprodutos/produto/editticket/${produto.id}?ticket=${record.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {text || "Sem nome"}
                </a>
            ),
        },
        {
            title: "Arquivo",
            dataIndex: "originalbanner",
            key: "originalbanner",
        },
        {
            title: "Categoria s",
            dataIndex: ["category", "name"],
            key: "category",
            render: (text: string) => text || "–",
        }
    ];


    return (
        <div style={{ padding: "1rem" }}>
            <AntTable2
                columns={columns}
                dataSource={record.produtos || []}
                pagination={false}
                rowKey="id"
                size="small"
                bordered
            />
        </div>
    );
};

export default function UsuarioList() {

const [isModalVisible, setIsModalVisible] = useState(false);
const [mensagensAtivas, setMensagensAtivas] = useState<string[]>([]);
const [modalParam, setModalParam] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

const showMensagens = (mensagens: any[]) => {
    const texts = mensagens.map((m) => (m.created_at + " - " + m.mensagem )).filter(Boolean);
    setMensagensAtivas(texts);
    setIsModalVisible(true);
};

const { show, edit, create, list } = useNavigation();

const router =  useRouter();
        
const handleOpenModal = (id: string) => {
    setModalParam(id);
    setModalOpen(true);
};


const handleCloseModal = () => {
    setIsModalVisible(false);
    setMensagensAtivas([]);
};
  const [progressMap, setProgressMap] = useState<Record<string, number | null>>({});
  const abortControllers = useRef<Record<string, AbortController>>({});
  const { tableProps  } = useTable({ resource: "ticket/status/ANALISEINTERNA", syncWithLocation: true });

const invalidate = useInvalidate();

  const handleFinalizar = async (id: string) => {
        const token = await getCookieClient();
        const response = await api.post("/ticket/close/"+id,{},
            { headers: {
                Authorization: `Bearer ${token}`,
            }}
        );

        invalidate({
            resource: "ticket/status/ANALISEINTERNA",
            invalidates: ["list"],
        });
  }

    const handleCriarProduto = async (id: string) => {
       // const token = await getCookieClient();

      //  create("products" + id);

        router.push("/signed/cadprodutos/produto/createticket?ticket=" + id)
        // invalidate({
        //     resource: "ticket/status/ANALISEINTERNA",
        //     invalidates: ["list"],
        // });
  }


   const downloadFileWithProgressR2 = async (
    url: string,
    filename: string,
    onProgress: (percent: number) => void,
     abortSignal: AbortSignal
) => {
    console.log("Baixando");
    console.log(url);
    const response = await axios.get(url, {
        responseType: "blob",
        onDownloadProgress: (event) => {
            const percent = Math.round((event.loaded * 100) / (event.total || 1));
            onProgress(percent);
        },signal: abortSignal, 
    });

    
    // Extract original filename from Content-Disposition
    const contentDisposition = response.headers["content-disposition"];

    saveAs(response.data, filename);
};

const handleDownload = async (id: string, documentos : any[]) => {
        const token = await getCookieClient();
        for (const doc of documentos ) {
            const controller = new AbortController();
            abortControllers.current[id] = controller;
            setProgressMap((prev) => ({ ...prev, [id]: 0 }));
            try {
                const url = await api.get("/repositorio/" + doc.id_r2, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                await downloadFileWithProgressR2(url.data, doc.r2.originalname,
                    (percent) => setProgressMap((prev) => ({ ...prev, [id]: percent })),
                    controller.signal
                );

            } catch (err:any) {
                console.log(err);
            }

            delete abortControllers.current[id];
            setProgressMap((prev) => ({ ...prev, [id]: null }));
            }
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
/*   const handleDownload = async (id: string) => {
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
 */
    const handleAttachMensagem = async (values: { mensagem : string }) => {
    const mensagem = values.mensagem?.trim();
    if (!mensagem) return;
    const token = await getCookieClient();
    try {


        await api.post("/ticket/mensagem", {
                     mensagem: mensagem,
                     ticket_id: modalParam,
             },{
             headers: {
                 Authorization : `Bearer ${token}`
             } 
       });
        const response = await api.patch("/ticket/"+modalParam, { status: "REJEITADO"},
            { headers: {
                Authorization: `Bearer ${token}`,
            }}
        );
        invalidate({
            resource: "ticket/status/ANALISEINTERNA",
            invalidates: ["list"],
        });

       setModalOpen(false);
    } catch (err) {
      console.error(err);
    
    }
  };
    const handleDelete = async (prodid:string) => {
        const token = await getCookieClient();
    try {


        await api.delete("/product/" + prodid, {
             headers: {
                 Authorization : `Bearer ${token}`
             } 
           });
        invalidate({
            resource: "ticket/status/ANALISEINTERNA",
            invalidates: ["list"],
        });

           setModalOpen(false);
        } catch (err) {
        console.error(err);
    
        }



    }   

    const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
useEffect(() => {
    if (tableProps?.dataSource) {
        setExpandedRowKeys(
            tableProps.dataSource
                .map((item: BaseRecord) => item.id?.toString())
                .filter(Boolean) as string[]
        );
    }
}, [tableProps?.dataSource]);    

const expandedRowRender = (record: any) => {
    const columns = [

        {
            title: "Categoria",
            dataIndex: ["category", "name"],
            key: "category",
            render: (text: string) => text || "–",
        },
        {
            title: "Nome do Produto",
            dataIndex: "name",
            key: "name",
            render: (text: string, produto: any) => (
                <a
                    href={`/signed/cadprodutos/produto/editticket/${produto.id}?ticket=${record.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {text || "Sem nome"}
                </a>
            ),
        },
        {
            title: "Arquivo",
            dataIndex: "originalbanner",
            key: "originalbanner",
        },       
        {
            title: "Acoes",
            dataIndex: ["category", "acoes"],
            key: "actions",
            render: (text: string, produto: any) => (<>
                            <Space>
                            <a
                                href={`/signed/cadprodutos/produto/editticket/${produto.id}?ticket=${record.id}`}
                                target="_blank"
                                rel="noopener noreferrer">
                                <EditOutlined style={{ fontSize: 16 }} />
                            
                            </a>
                             <span onClick={() => handleDelete(produto.id)} style={{ cursor: "pointer", color: "red" }}>
                                <DeleteOutlined style={{ fontSize: 16 }} />   
                             </span>
                        </Space>
            
            </>),
        },
    ];

    return (
        <div style={{ padding: "1rem" }}>
            <AntTable
                columns={columns}
                dataSource={record.produtos || []}
                pagination={false}
                rowKey="id"
                size="small"
                bordered
            />
        </div>
    );
};



  return (
    <List>
        <Table
            {...tableProps}
            rowKey="id"
            expandable={{
                expandedRowRender,
                // other props like expandedRowKeys, etc
            }}
        >

        <Table.Column dataIndex="numero" title="Ticket" />
        <Table.Column
        title="Usuario"
        render={(_, record: any) => {
            return (
            <>
                {record.usuarios?.name || "–"}
            </>
            );
        }}
        />       
         <Table.Column
        title="Empresas"
        render={(_, record: any) => {
            return (
            <>

                {(record.usuarios?.empresa || []).map((x: any, index: number) => (
                <div key={index}>{x.empresa?.nomefantasia}</div>
                ))}
            </>
            );
        }}
        />
        <Table.Column dataIndex="originalbanner" title="Arquivo" />
        {/* <Table.Column dataIndex="descricao" title="Descricao" />
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
        /> */}
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
            const documentos = record.r2;

            return (
            <Space direction="vertical" size="small">
                <Space>
                <Button onClick={() => handleDownload(id, documentos)} size="small" disabled={!!progress}>
                    Baixar
                </Button>
                <Button onClick={() => handleOpenModal(id)} size="small" disabled={!!progress}>
                    Rejeitar
                </Button>
                </Space>

                <Button onClick={() => handleFinalizar(id)} size="small" disabled={!!progress}>
                FINALIZAR
                </Button>

                <Button onClick={() => handleCriarProduto(id)} size="small" disabled={!!progress}>
                CRIAR PRODUTO
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

