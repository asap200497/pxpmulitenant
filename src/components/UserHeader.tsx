"use client";

import { Avatar, Dropdown, Space, Typography } from "antd";
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import axios from "axios";

import { useSession } from "@/providers/SessionProvider";
import { useTenant } from "@/providers/TenantProvider";
import { deleteCookie } from 'cookies-next'
import { toast } from "react-hot-toast";

const { Text } = Typography;

export function UserHeader() {
  const session = useSession();
  const tenant = useTenant();
  const router = useRouter();


const handleLogout = async () => {

        deleteCookie("session", { path: "/"});
        toast.success("Logout com suceso");

            router.replace(
      `/?customer=${encodeURIComponent(tenant.id)}`
    );
  };

  return (
    <Space size="middle">
      <div style={{ textAlign: "right" }}>
        <Text strong style={{ display: "block" }}>
          {session.name}
        </Text>


      </div>

      <Dropdown
        trigger={["click"]}
        menu={{
          items: [
            {
              key: "profile",
              icon: <UserOutlined />,
              label: "Meu perfil",
              disabled: true,
            },
            {
              key: "settings",
              icon: <SettingOutlined />,
              label: "Configurações",
              disabled: true,
            },
            { type: "divider" },
            {
              key: "logout",
              icon: <LogoutOutlined />,
              label: "Sair",
              danger: true,
              onClick: handleLogout,
            },
          ],
        }}
      >
        <Avatar
          size={40}
          icon={<UserOutlined />}
          style={{
            backgroundColor: tenant.colors.primary,
            cursor: "pointer",
          }}
        />
      </Dropdown>
    </Space>
  );
}