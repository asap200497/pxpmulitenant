"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Select,
  Skeleton,
  Table,
  Tag,
  Typography,
  Grid,
  List,
  Divider,
  Space,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { api } from "@/services/api";
import { getCookieClient } from "@/lib/cookieClient";

type Choice = string;
type OptionDef = { choices: Choice[]; default: Choice; description: string };
type OptionsMap = Record<string, OptionDef>;

type Item = {
  printeroption: { option_name: string };
  id: number;
  value: string;
  defaultvalue: boolean;
};
type Payload = { data: Record<string, Item[]> };

type Row = {
  key: string;               // `${option_name}:${id}`
  printeroption: string;
  id: number;
  value: string;
  defaultvalue: boolean;
};

type Props = {
  initialData?: Payload;
  fetchUrl?: string;
  selectionOptions?: { label: string; value: string }[]; // global fallback
  onSelectionChange?: (map: Record<string, string | undefined>) => void;
  title?: string;
  driverOptions?: OptionsMap;                              // impresx.options
  defaultSelections?: Record<string, string | undefined>; // preloaded map
};

export function PrinterDriverOptionsTable({
  initialData,
  fetchUrl = "/parametros/impressora",
  selectionOptions,
  onSelectionChange,
  title = "Opções do driver da impressora",
  driverOptions,
  defaultSelections,
}: Props) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md; // xs/sm => mobile layout

  const [loading, setLoading] = useState(!initialData);
  const [payload, setPayload] = useState<Payload | null>(initialData ?? null);

  useEffect(() => {
    let alive = true;
    if (initialData) return;
    (async () => {
      try {
        setLoading(true);
        const token = await getCookieClient();
        const response = await api.get(fetchUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!alive) return;
        setPayload(response.data);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [fetchUrl, initialData]);

  // Build one master list from driverOptions (value format "Opt=Choice")
  const masterDriverOptions = useMemo(() => {
    if (!driverOptions) return undefined;
    const entries: { label: string; value: string }[] = [{ label: "— (none) —", value: "" }];
    const sortedKeys = Object.keys(driverOptions).sort((a, b) => a.localeCompare(b));
    for (const optName of sortedKeys) {
      const def = driverOptions[optName]?.default;
      const choices = driverOptions[optName]?.choices ?? [];
      const sortedChoices = [...choices].sort((a, b) => {
        if (a === def && b !== def) return -1;
        if (b === def && a !== def) return 1;
        return a.localeCompare(b);
      });
      for (const c of sortedChoices) {
        entries.push({
          value: `${optName}=${c}`,
          label: `${optName}=${c}${c === def ? " (default)" : ""}`,
        });
      }
    }
    return entries;
  }, [driverOptions]);

  // Fallback when there’s no impresx.options provided
  const globalFallbackOptions = useMemo(
    () =>
      selectionOptions ?? [
        { label: "— (none) —", value: "" },
        { label: "Profile A", value: "profile_a" },
        { label: "Profile B", value: "profile_b" },
      ],
    [selectionOptions]
  );

  const rows: Row[] = useMemo(() => {
    if (!payload?.data) return [];
    const flat: Row[] = [];
    for (const [optName, items] of Object.entries(payload.data)) {
      for (const it of items) {
        flat.push({
          key: `${optName}:${it.id}`,
          printeroption: optName,
          id: it.id,
          value: it.value,
          defaultvalue: it.defaultvalue,
        });
      }
    }
    flat.sort((a, b) =>
      a.printeroption.localeCompare(b.printeroption) ||
      (a.defaultvalue === b.defaultvalue ? 0 : a.defaultvalue ? -1 : 1) ||
      a.value.localeCompare(b.value) ||
      a.id - b.id
    );
    return flat;
  }, [payload]);

  const [chosen, setChosen] = useState<Record<string, string | undefined>>({});

  // Initialize from defaultSelections and emit immediately
  useEffect(() => {
    const initial = defaultSelections ?? {};
    setChosen(initial);
    onSelectionChange?.(initial); // emit even if {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSelections]);

  // Ensure current value renders even if not present in master list
  const optionsForValue = (current?: string) => {
    const base = masterDriverOptions ?? globalFallbackOptions;
    if (!current || current === "") return base;
    return base.some((o) => o.value === current)
      ? base
      : [{ label: current, value: current }, ...base];
  };

  // ---- Desktop table columns
  const columns: ColumnsType<Row> = [
    {
      title: "Printer Option",
      dataIndex: "printeroption",
      key: "printeroption",
      width: 220,
      render: (text) => <Typography.Text code>{text}</Typography.Text>,
      sorter: (a, b) => a.printeroption.localeCompare(b.printeroption),
      defaultSortOrder: "ascend",
      ellipsis: true,
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100,
      sorter: (a, b) => a.id - b.id,
      responsive: ["md"], // hide on small screens even in table mode
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (text, record) => (
        <>
          {text} {record.defaultvalue && <Tag>default</Tag>}
        </>
      ),
      sorter: (a, b) => a.value.localeCompare(b.value),
      ellipsis: true,
    },
    {
      title: "Selection",
      key: "selection",
      width: 360,
      render: (_, record) => {
        const val = chosen[record.key];
        return (
          <Select
            style={{ width: "100%" }}
            size="middle"
            value={val}
            options={optionsForValue(val)}
            onChange={(v) => {
              const next = { ...chosen };
              if (!v) delete next[record.key];
              else next[record.key] = v;
              setChosen(next);
              onSelectionChange?.(next); // emit synchronously
            }}
            allowClear
            placeholder="Selecione…"
            showSearch
            optionFilterProp="label"
          />
        );
      },
    },
  ];

  // ---- Mobile layout (group by printeroption; each group is a Card with mini list)
  const grouped = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const r of rows) {
      if (!map.has(r.printeroption)) map.set(r.printeroption, []);
      map.get(r.printeroption)!.push(r);
    }
    // stable group order
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [rows]);

  const MobileGroup = ({
    optName,
    items,
  }: {
    optName: string;
    items: Row[];
  }) => (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      title={<Typography.Text code>{optName}</Typography.Text>}
      bodyStyle={{ padding: 12 }}
    >
      <List
        itemLayout="vertical"
        split
        dataSource={items}
        renderItem={(r) => {
          const val = chosen[r.key];
          return (
            <List.Item style={{ padding: "8px 0" }}>
              <Space direction="vertical" style={{ width: "100%" }} size={6}>
                <Space wrap size={6} style={{ justifyContent: "space-between", width: "100%" }}>
                  <Typography.Text style={{ fontSize: 13 }}>
                    #{r.id} — {r.value}
                  </Typography.Text>
                  {r.defaultvalue && <Tag style={{ marginInline: 0 }}>default</Tag>}
                </Space>
                <Select
                  style={{ width: "100%" }}
                  size="large" // bigger tap target on mobile
                  value={val}
                  options={optionsForValue(val)}
                  onChange={(v) => {
                    const next = { ...chosen };
                    if (!v) delete next[r.key];
                    else next[r.key] = v;
                    setChosen(next);
                    onSelectionChange?.(next);
                  }}
                  allowClear
                  placeholder="Selecione…"
                  showSearch
                  optionFilterProp="label"
                />
              </Space>
            </List.Item>
          );
        }}
      />
    </Card>
  );

  return (
    <Card title={title} bordered>
      {loading ? (
        <Skeleton active paragraph={{ rows: isMobile ? 5 : 8 }} />
      ) : isMobile ? (
        <>
          {grouped.map(([optName, items]) => (
            <MobileGroup key={optName} optName={optName} items={items} />
          ))}
          <Divider />
          <Typography.Paragraph type="secondary" style={{ fontSize: 12, margin: 0 }}>
            Dica: toque no valor para escolher um preset do driver. Os nomes podem não coincidir — isso é intencional.
          </Typography.Paragraph>
        </>
      ) : (
        <Table<Row>
          rowKey="key"
          size="middle"
          dataSource={rows}
          columns={columns}
          pagination={{ pageSize: 20, responsive: true, size: "small" }}
          bordered
          sticky
          scroll={{ x: 720 }} // avoids column squeeze on small laptops
        />
      )}
    </Card>
  );
}
