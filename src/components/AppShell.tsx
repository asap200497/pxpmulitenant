"use client";

import { Layout, Menu } from "antd";
import { useRouter, usePathname } from "next/navigation";
import {
  DashboardOutlined,
  PrinterOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

import { CustomerLogo }  from "./CustomerLogo";

const { Sider, Header, Content } = Layout;

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (

    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={240} theme="light">
        <div style={{ padding: 16 }}>
          <CustomerLogo />
        </div>

        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          onClick={({ key }) => router.push(key)}
          items={[
            {
              key: "/signed/dashboard",
              icon: <DashboardOutlined />,
              label: "Dashboard",
            },
            {
              key: "/signed/produtos",
              icon: <AppstoreOutlined />,
              label: "Produtos",
            },
            {
              key: "/signed/os",
              icon: <PrinterOutlined />,
              label: "Ordens de Serviço",
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "var(--tenant-surface)",
            padding: "0 24px",
          }}
        >
          PrintXPert ERP
        </Header>

        <Content style={{ padding: 24 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
    
  );
}