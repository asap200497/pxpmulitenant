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
    syncWithLocation: true,
  });


  interface IGrupos {
    grupo: {
      id: string,
      nome: string
    }
  }
    interface IEmpresa {
    empresa: {
      id: string,
      nomefantasia: string
    }
  }

  return (
    <List>
      <Table {...tableProps} rowKey="id">
           <Table.Column
                title="No."
                key="index"
                render={(_, __, index) => index + 1}
            />
        <Table.Column dataIndex="name" title={"Nome"} />
        <Table.Column
          dataIndex={"empresa"}
          title={"Empresas"}
          render={(value) =>
              //categoryData?.data?.find((item) => item.id === value?.id)?.id
              value.map( (ip : IEmpresa) => ip.empresa.nomefantasia).join(",")   
          }
        />
        <Table.Column
          dataIndex={"grupos"}
          title={"Grupos"}
          render={(value) =>
              //categoryData?.data?.find((item) => item.id === value?.id)?.id
              value.map( (ip : IGrupos) => ip.grupo.nome).join(",")   
          }
        />
  
  
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
