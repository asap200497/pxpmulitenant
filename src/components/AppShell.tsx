
"use client";

import { useMenu } from "@refinedev/core";
import { useRouter } from "next/navigation";
import { CustomerLogo } from "./CustomerLogo";
import { Layout, Menu, Button } from "antd";
import type { MenuProps } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useTenant } from "@/providers/TenantProvider";
import { UserHeader } from "@/components/UserHeader";
import { toast } from "react-hot-toast";
import { deleteCookie } from 'cookies-next'

const { Sider, Content, Header } = Layout;

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { menuItems, selectedKey, defaultOpenKeys } = useMenu();
  const router = useRouter();
  const tenant = useTenant();

const handleLogout = async () => {

        deleteCookie("session", { path: "/"});
        toast.success("Logout com suceso");

            router.replace(
      `/?customer=${encodeURIComponent(tenant.id)}`
    );
  };

  const buildMenu = (
    items: typeof menuItems
  ): NonNullable<MenuProps["items"]> =>
    items.map((item) => ({
      key: item.key,
      label: item.label,
      children: item.children?.length
        ? buildMenu(item.children)
        : undefined,
      onClick: item.route
        ? () => router.push(item.route!)
        : undefined,
    }));

  return (
    <Layout style={{ minHeight: "100vh" }}>

      {/* LEFT SIDEBAR */}
      <Sider theme="light" width={240}>
        <CustomerLogo />

        <Menu
          mode="inline"
          items={buildMenu(menuItems)}
          selectedKeys={selectedKey ? [selectedKey] : []}
          defaultOpenKeys={defaultOpenKeys}
        />

        <div style={{ padding: "12px 16px" }}>
          <Button
            icon={<LogoutOutlined />}
            danger
            block
            onClick={handleLogout}
          >
            Sair
          </Button>
        </div>
      </Sider>

      {/* RIGHT SIDE — THIS NESTED LAYOUT IS THE FIX */}
      <Layout>

        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            lineHeight: "normal", // Important!
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 16 }}>
            {tenant.name} ERP
          </span>

          <UserHeader />
        </Header>

        <Content
          style={{
            padding: 24,
            background: "#f5f5f5",
            minWidth: 0,
          }}
        >
          {children}
        </Content>

      </Layout>

    </Layout>
  );
}
