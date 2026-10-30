"use client";
import { useState } from "react";
import { api } from  '@/services/api'
import { getCookieClient } from "@/lib/cookieClient"
import {
  BooleanField,
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
  Show
} from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Button, Space, Table, Modal, Form, Input, message } from "antd";

import { useShow, useOne } from "@refinedev/core";
import * as ReactInputMask from "react-input-mask";
const InputMask = ReactInputMask.default;

export default function UsuarioList() {


  const { tableProps } = useTable({ syncWithLocation: true });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<BaseRecord | null>(null);

  const handleCustomAction = (record: BaseRecord) => {
    setSelectedEmpresa(record);
    setModalOpen(true);
  };

  const handleAttachPessoa = async (values: { cpf: string }) => {
    const cpf = values.cpf?.trim();
    if (!cpf || !selectedEmpresa?.id) return;
    const token = await getCookieClient();
    try {
      // 1. Search user by CPF
      const res = await api.get("/usuario/search", {
             headers: {
                 Authorization : `Bearer ${token}`
             },params: { cpf },
        });

      const usuario = res.data;
      if (!usuario?.id) {
        message.error("Usuário não encontrado.");
        return;
      }
      // 2. Attach user to empresa
      await api.post("/empresa/add-usuario", {
                     empresa_id: selectedEmpresa.id,
                     user_id: usuario.id,
             },{
             headers: {
                 Authorization : `Bearer ${token}`
             } 

  
       });

      message.success(`Pessoa anexada: ${usuario.name}`);
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      message.error("Erro ao anexar pessoa.");
    }
  };


  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          title="No."
          key="index"
          render={(_, __, index) => index + 1}
        />

        <Table.Column dataIndex="nomefantasia" title="Empresa" />
        <Table.Column dataIndex="habilitada" title="Ativa"  render={(value: any) => <BooleanField value={value} />}  />
        <Table.Column dataIndex="cnpj" title="CNPJ" />
        <Table.Column
          dataIndex={["created_at"]}
          title="Criado em"
          render={(value: any) => <DateField value={value} />}
        />
        <Table.Column
          title="Ações"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
              <Button size="small" onClick={() => handleCustomAction(record)}>
                + Pessoa
              </Button>
            </Space>
          )}
        />
      </Table>

      {/* ✅ Modal to attach pessoa by CPF */}
      <Modal
        open={modalOpen}
        title={`Anexar Pessoa à ${selectedEmpresa?.nomefantasia}`}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleAttachPessoa}>

          <Form.Item
            name="cpf"
            label="CPF da Pessoa"
            rules={[
              { required: true, message: "CPF é obrigatório" },
              {
                pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                message: "Formato de CPF inválido",
              },
            ]}
          >
           <InputMask mask="999.999.999-99" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Anexar Pessoa
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </List>
  );
}
