"use client";

import { getCookieClient } from "@/lib/cookieClient";
import { api } from "@/services/api";
import { EmpresaProps } from "@/interfaces/index";
import { ProductProps } from "@/lib/product.type";
import { useEffect, useState } from "react";

import type { DataNode } from "antd/es/tree";
import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  MarkdownField,
  ShowButton,
  useTable,
} from "@refinedev/antd";

import {  useParsed } from "@refinedev/core";
import {
    ApartmentOutlined,
    AppstoreOutlined,
    UserOutlined,
    BookOutlined,
    ClusterOutlined,
} from "@ant-design/icons";
import { Card, Tree, Tag, Space, Typography, Divider, Row, Col } from "antd";
const { Text } = Typography;


function convertToTreeData(data: EmpresaProps[]): DataNode[] {
    return data.map((item) => {
        const count = item._count?.usuariosEmpresa ?? 0;

        const usuarios = item.usuariosEmpresa?.map((u, idx) => (
            <Tag
                key={idx}
                color="blue"
                icon={<UserOutlined />}
                style={{ marginBottom: 4 }}
            >
                {u.usuario.name}
            </Tag>
        ));


        
        const categorias = item.categorias?.map((c, idx) => {
            const categoria = c?.categorias;
            if (!categoria) return null;

            return (
                <div key={idx} style={{ marginBottom: 12 }}>
                    <Text strong style={{ display: "block", marginBottom: 4 }}>
                        <AppstoreOutlined style={{ marginRight: 6 }} />
                        {categoria.name}
                    </Text>
                    {categoria.product?.length > 0 ? (
                        <Space wrap size={[8, 4]}>
                            {categoria.product.map((prod, pidx) => (
                                <Tag
                                    key={pidx}
                                    icon={<BookOutlined />}
                                    style={{
                                        backgroundColor: "#f5f5f5",
                                        border: "1px solid #ddd",
                                    }}
                                >
                                    {prod.name}
                                </Tag>
                            ))}
                        </Space>
                    ) : (
                        <Text type="secondary" style={{ fontSize: "0.8em" }}>
                            (sem produtos)
                        </Text>
                    )}
                </div>
            );
        });

        return {
            key: item.id,
            title: (
                <Card
                    size="small"
                    bordered
                    bodyStyle={{ padding: 16 }}
                    style={{ width: "100%", backgroundColor: "#fafafa" }}
                >
                    <Row gutter={24}>
                        {/* Col 1: Company Info */}
                        <Col span={8}>
                            <Space direction="vertical" size={6}>
                                <Text strong style={{ fontSize: "1.1em" }}>
                                    <ApartmentOutlined style={{ marginRight: 6 }} />
                                    {item.nomefantasia}
                                </Text>
                                {/* <Text type="secondary">CNPJ: {item.cnpj}</Text> */}
                                <Text type="secondary">
                                    <UserOutlined style={{ marginRight: 4 }} />
                                    {count} usuário{count !== 1 ? "s" : ""}
                                </Text>
                            </Space>
                        </Col>

                        {/* Col 2: Funcionários */}
                        <Col span={8}>
                            <Text strong>PESSOAS</Text>
                            <div style={{ marginTop: 6 }}>
                                {usuarios?.length ? usuarios : <Text type="secondary">(nenhum)</Text>}
                            </div>
                        </Col>

                        {/* Col 3: Categorias e Produtos */}
                        <Col span={8}>
                            <Text strong>CATEGORIAS</Text>
                            <div style={{ marginTop: 6 }}>
                                {categorias?.length ? categorias : <Text type="secondary">(nenhuma)</Text>}
                            </div>
                        </Col>
                    </Row>
                </Card>
            ),
            children: item.children ? convertToTreeData(item.children) : [],
        };
    });
}
function buildTree(data: EmpresaProps[]): EmpresaProps[] {
    const map = new Map<string, EmpresaProps & { children?: EmpresaProps[] }>();
    const roots: EmpresaProps[] = [];

    data.forEach((item) => {
        map.set(item.id, { ...item, children: [] });
    });

    map.forEach((item) => {
        if (item.empresapai_id) {
            const parent = map.get(item.empresapai_id);
            if (parent) {
                parent.children!.push(item);
            }
        } else {
            roots.push(item);
        }
    });

    return roots;
}


export default function EmpresaTreeView() {

    const { resource } = useParsed();


    const { tableProps } = useTable({
 //       resource: resource?.name ?? "dashboardrelated", // fallback in case resource is undefined
        pagination: { pageSize: 1000 },
  
    });

    const [treeData, setTreeData] = useState<DataNode[]>([]);

    useEffect(() => {
        if (tableProps.dataSource?.length) {
            const tree = buildTree([...tableProps.dataSource] as EmpresaProps[]);
            const converted = convertToTreeData(tree); // ✅ correct function
            setTreeData(converted);
        }
    }, [tableProps.dataSource]);

    return (
        <div style={{ padding: 24 }}>
            <h2>Árvore de Empresas</h2>
            <Tree treeData={treeData} defaultExpandAll />
        </div>
    );
}
