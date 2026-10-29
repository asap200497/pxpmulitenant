"use client";

import { Card, Typography } from "antd";

export default function DashboardPage() {
  return (
    <Card>
      <Typography.Title level={2}>
        Dashboard
      </Typography.Title>

      <p>Welcome to PrintXPert Multi-Tenant!</p>
    </Card>
  );
}