"use client";

import { useEffect, useState } from "react";
import { getCookieClient } from "@/lib/cookieClient";
import { api } from "@/services/api";
import { TicketProps } from "@/interfaces/index";
import { Table } from "antd";

export default function Dashboard() {
    const [tickets, setTickets] = useState<TicketProps[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const token = getCookieClient(); // this can be synchronous if using cookies-next

                const response = await api.get("ticket/status/ANALISEINTERNA", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTickets(response.data.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchTickets();
    }, []);

        return (
                <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
                    <h1>Tickets</h1>
                    <Table
                        dataSource={tickets}
                        rowKey="id"
                        loading={loading}
                        columns={[
                            {
                                title: "numero",
                                dataIndex: "numero",
                                key: "id",
                            },
                            {
                                title: "Descrição",
                                dataIndex: "descricao",
                                key: "descricao",
                            },
                            {
                                title: "Acoes",
                                key: "acoes",
                            },
                        ]}
                    />
                </div>
            );
}
