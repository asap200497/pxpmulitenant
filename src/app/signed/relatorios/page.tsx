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

import { useSelect } from "@refinedev/antd";
import { Select, DatePicker , Typography } from "antd";
import dayjs, { Dayjs } from "dayjs";
import type { RangePickerProps } from "antd/es/date-picker"; // 

const { Text } = Typography;
const { RangePicker } = DatePicker;
type StatusOpt = { value: string; label: string };

export default function OrdersList() {
  const { tableProps , setFilters,  filters ,  tableQuery , setCurrentPage} = useTable({
    resource: "orders",
    syncWithLocation: false,
    filters: {
      initial: [
        { field: "status", operator: "eq", value: undefined }, // start with “all”
        { field: "created_at", operator: "gte", value: undefined },
        { field: "created_at", operator: "lte", value: undefined },
      ],
      mode: "server", // (default) keep server-side filtering
    },
     queryOptions: {
      select: (response: any) => {
        return {
          data: response.data,     // table records
          total: response.total ?? 0,    // pagination
          totalValor: response.totalValor ?? 0, // 👈 custom total
        };
      },
    },
  });

const totalAmount = tableQuery?.data?.totalValor;

    const { selectProps: statusSelectProps  } = useSelect<StatusOpt>({
      resource: "order/statuslist",
      optionLabel: "label",
      optionValue: "value",
      
});

 const onStatusChange = (val?: string) => {
    setFilters([{ field: "status", operator: "eq", value: val ?? undefined }], "merge");
  };

  const onStartChange = (d: Dayjs | null) => {
    setCurrentPage(1);
    setFilters(
      [{ field: "created_at", operator: "gte", value: d ? d.startOf("day").toISOString() : undefined }],
      "merge"
    );
  };

  const onEndChange = (d: Dayjs | null) => {
        setCurrentPage(1);
    setFilters(
      [{ field: "created_at", operator: "lte", value: d ? d.endOf("day").toISOString() : undefined }],
      "merge"
    );
  };

  return (
  
    
    <List
     headerButtons={
        <Space>
          <span>Status:</span>
          <Select
            allowClear
            placeholder="All"
            style={{ width: 220 }}
            {...statusSelectProps}
//            value={currentStatus}
             onChange={(val) => {
              setFilters(
                [{ field: "status", operator: "eq", value: val ?? undefined }],
                "replace"
              );
              setCurrentPage(1);
            }} 
          />
          <span>Inicio:</span>
          <DatePicker onChange={onStartChange} format="YYYY-MM-DD" placeholder="Sel Data" />
          <span>Fim:</span>
          <DatePicker onChange={onEndChange} format="YYYY-MM-DD" placeholder="Sel Data" />
          <Text strong style={{ marginLeft: 20 }}>
            Valor Total:&nbsp;
            <Text type="success">
              R$ {Number(totalAmount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </Text>
          </Text>
          </Space>
      }
     
    >
      
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="numero" title={"Numero"} />
        <Table.Column dataIndex="status" title={"Status"} />  
        <Table.Column dataIndex={["usuario", "name"]} title={"Cliente"} />  
        <Table.Column dataIndex={["franqueados", "nomefantasia"]} title={"Franqueado"} />  
        <Table.Column
          dataIndex="total"
          title="Total"
          align="right"
          render={(value: string | number) => (
            <span>
              R$ {Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          )}
        />


        <Table.Column
          dataIndex={["created_at"]}
          title={"Data"}
          render={(value: any) => <DateField value={value} format="YYYY-MM-DD"  />}
        /> 
        {/* <Table.Column
          title={"Actions"}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        /> */}
      </Table>
    </List>
  );
}
