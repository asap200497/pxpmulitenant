"use client";
import { api } from '@/services/api';
import { getCookieClient } from "@/lib/cookieClient";

import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  MarkdownField,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord, useMany } from "@refinedev/core";
import toast from 'react-hot-toast';
import { Space, Table, InputNumber, Button, Tooltip, Checkbox, Select } from "antd";
import { useState } from "react";
import { CloseCircleOutlined, ExclamationCircleOutlined, CloudDownloadOutlined, PrinterOutlined, CheckOutlined } from "@ant-design/icons";
import { Edit, useForm, useSelect } from "@refinedev/antd";

export default function PrintersList() {
  const { selectProps } = useSelect({
    resource: "listafranqueados",
    optionLabel: "label",
    optionValue: "value",
  });
  const [franqueado, setFranqueado] = useState<string>("");

  const { tableProps } = useTable({
    pagination: { pageSize: 10 },
    queryOptions: { refetchInterval: 10000 },
    syncWithLocation: true,
  });

  const handleReset = async (franqueado_id: string) => {
    const tokenx = await getCookieClient();
    await api.put(
      `/parametros/impressora/reset/${franqueado_id}`,
      {},
      { headers: { Authorization: `Bearer ${tokenx}` } },
    );
    toast.success("Reset Solicitado");
  };

  return (
    <List>
      <Select
        {...selectProps}
        placeholder="Selecione o Franqueado"
        onChange={(value) => {
          // mantém o comportamento padrão do useSelect
          setFranqueado(String(value));
        }}
      />

      <Tooltip title="Finalizar">
        <Button
          type="primary"
          size="small"
          icon={<CheckOutlined />}
          disabled={!franqueado}
          onClick={() => {
            if (franqueado) {
              handleReset(franqueado);
            } else {
              toast.error("Selecione um franqueado primeiro");
            }
          }}
        >
          Reiniciar impressoras
        </Button>
      </Tooltip>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          title="No."
          key="index"
          render={(_, __, index) => index + 1}
        />
        <Table.Column dataIndex={["franqueado", "nomefantasia"]} title={"Franquia"} />
        <Table.Column dataIndex={["franqueado", "cidade"]} title={"Cidade"} />
        <Table.Column dataIndex={["franqueado", "estado"]} title={"Estado"} />
        <Table.Column dataIndex="name" title={"Impresora"} />
        <Table.Column dataIndex="shortname" title={"Nome Curto"} />

        <Table.Column
          title={"Actions"}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
