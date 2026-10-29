"use client";
import axios from "axios";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { toast } from 'react-hot-toast';
import { Card, Form, Input, Button, Typography } from "antd";
import { IdcardOutlined, LockOutlined } from "@ant-design/icons";
import { useTenant } from "@/providers/TenantProvider";
import styles from "@/styles/login.module.scss";
import { serverLogin } from "./serverlogin";
const { Title, Text } = Typography;

export function LoginPanel() {
  const tenant = useTenant();
  const router = useRouter();
 const [messageApi, contextHolder] = message.useMessage(); 

 const onFinish = async (values: {
  cpf: string;
  password: string;
}) => {
  try {

    const resp = await serverLogin(
      values.cpf.replace(/\D/g, ""),
      values.password,
      tenant.id
    );

    if (resp.ok) {

      router.push("/signed/dashboard");
    } else {
      toast.error(resp.message || "Erro no login");
    }
    router.refresh();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      messageApi.error(
        error.response?.data?.error ?? "Authentication failed"
      );
    } else {
      messageApi.error("Unexpected error");
    }
  }
}

  return (
    <Card className={styles.loginCard}>
      <Title level={3} style={{ textAlign: "center" }}>
        Acessar Sistema
      </Title>

      <Text
        type="secondary"
        style={{
          display: "block",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        {tenant.name}
      </Text>

      <Form
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
      >
        <Form.Item
          label="CPF"
          name="cpf"
          rules={[
            { required: true, message: "Informe seu CPF" },
          ]}
        >
          <Input
            size="large"
            prefix={<IdcardOutlined />}
            placeholder="000.000.000-00"
          />
        </Form.Item>

        <Form.Item
          label="Senha"
          name="password"
          rules={[
            { required: true, message: "Informe sua senha" },
          ]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder="Senha"
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
        >
          Acessar
        </Button>
      </Form>
    </Card>
  );
}