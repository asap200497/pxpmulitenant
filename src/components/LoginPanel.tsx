"use client";

import { Card, Form, Input, Button, Typography } from "antd";
import { IdcardOutlined, LockOutlined } from "@ant-design/icons";
import { useTenant } from "@/providers/TenantProvider";
import styles from "@/styles/login.module.scss";

const { Title, Text } = Typography;

export function LoginPanel() {
  const tenant = useTenant();

  const onFinish = (values: {
    cpf: string;
    password: string;
  }) => {
    console.log("Tenant:", tenant.id);
    console.log("CPF:", values.cpf);

    // Authentication will be implemented later.
  };

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