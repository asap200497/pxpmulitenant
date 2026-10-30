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

export default function BlogPostList() {
  const { tableProps } = useTable({
            pagination: {
            pageSize: 10,
        },
        queryOptions: {
           refetchInterval: 10000
        },
        syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
           <Table.Column
                title="No."
                key="index"
                render={(_, __, index) => index + 1}
            />
        <Table.Column dataIndex={["empresa","nomefantasia"]} title={"Empresa"} />
        <Table.Column dataIndex="descricao" title={"Descricao"} />
        <Table.Column dataIndex="serial" title={"Nro Serie"} />
        <Table.Column
          dataIndex="updated_at"
          title="Status"
          render={(value: string) => {
            // Convert DB value (UTC) to Date
            const last = new Date(value);

            // Get "now" ALSO in UTC
            const now = new Date();
            const nowUtc = new Date(now.getTime());// + now.getTimezoneOffset() * 60000);

            // 1 minute threshold (in milliseconds)
            const threshold = 30 * 1000;

            // Offline if last update older than 1 minute (UTC comparison)
            const isOnline = nowUtc.getTime() - last.getTime() <= threshold;

            return isOnline
              ? <span style={{ color: "green" }}>Online</span>
              : <span style={{ color: "red" }}>Offline</span>;
          }}
        />

        {/* <Table.Column
          dataIndex={"category"}
          title={"Category"}
          render={(value) =>
            categoryIsLoading ? (
              <>Loading...</>
            ) : (
              categoryData?.data?.find((item) => item.id === value?.id)?.title
            )
          }
        /> */}
  
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
