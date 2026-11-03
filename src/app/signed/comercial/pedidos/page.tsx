"use client";

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
import { Space, Table } from "antd";

export default function UsuarioList() {
  const { tableProps } = useTable({
    resource: "orders/related",
    syncWithLocation: true,
    queryOptions: {
      refetchInterval: 10_000,               // every 10s
    }, 
  });


  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="numero" title={"Numero"} />
        <Table.Column dataIndex="status" title={"Status"} />  
        <Table.Column dataIndex="observacao" title={"Obs"} />  
        <Table.Column dataIndex="total" title={"Total"} />  


        <Table.Column
          dataIndex={["created_at"]}
          title={"Created at"}
          render={(value: any) => <DateField value={value} />}
        /> 
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
