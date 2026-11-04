"use client";

import { useState, useEffect } from "react";
import { InputNumber, Button, Card, Row, Col, Badge, Modal } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useList, useForm } from "@refinedev/core";
import { getCookieClient } from "@/lib/cookieClient";
import { api } from "@/services/api";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import * as ReactInputMask from "react-input-mask";
const InputMask = ReactInputMask.default;
import { useTenant } from "@/providers/TenantProvider";

const PdfThumbnail = dynamic(() => import("./pdfthumbnail"), {
    ssr: false,
});

export default function UsuarioList() {
    const router = useRouter();

    const [quantidades, setQuantidades] = useState<Record<string, number>>({});
    const [cartCount, setCartCount] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [cartItems, setCartItems] = useState<any[]>([]);

    const fetchCartCount = async () => {
        try {
            const token = await getCookieClient();
            const response = await api.get("/cart/count", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCartCount(response.data || 0);
        } catch (err) {
            console.error("Erro ao buscar o carrinho", err);
        }
    };

    

    useEffect(() => {
        fetchCartCount();
    }, []);

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const token = await getCookieClient();
                const response = await api.get("/cart", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCartItems(response.data.data[0].items || []);
            } catch (err) {
                console.error("Erro ao buscar itens do carrinho", err);
            }
        };

        if (modalOpen) {
            fetchCartItems();
        }
    }, [modalOpen]);

    const handleQuantidadeChange = (productId: string, value: number | null) => {
        setQuantidades((prev) => ({
            ...prev,
            [productId]: value ?? 1,
        }));
    };
    async function handledelete() {
        const token = await getCookieClient();
 
        await api.delete(
            "/cart",
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
 
        toast.success("carrinho limpo");
        await fetchCartCount(); // atualiza o contador local
        setModalOpen(false);
    }
    async function handleOrder() {
        const token = await getCookieClient();
 
        const order = await api.post(
            "/cart/order", {},
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        ) as { data: { id : string } };
        console.log (order);
        toast.success("Pedido Inserido");
        setModalOpen(false);
        router.push("/signed/comercial/pedidos/edit/" + order.data.id )

    }
        async function fetchAddressByCep(cep: string) {

      const token = await getCookieClient();

      const data = await api.get("/correios/cep?cep=" + cep,  {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
              }) as any;
        console.log(data.data);
      if (data.data) {
            setenderecodestino( data.data?.endereco + "-" + data.data?.cidade + "-" + data.data?.estado);
          // Optionally update form fields like:
      } else {
          console.warn("CEP não encontrado");
      }
    }

    async function handleCarrinho(id: string) {
        const token = await getCookieClient();
        const quantidade = quantidades[id] ?? 1;

        await api.post(
            "/cart/add",
            { product_id: id, quantity: quantidade },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        toast.success("Item adicionado ao carrinho!");
        await fetchCartCount(); // atualiza o contador local
    }

    const { query } = useList({ resource: "product/status/ONLINE", 
});

    const products = query.data?.data ?? [];

    const grouped = products.reduce((acc: Record<string, typeof products>, product) => {
        const categoryName = product.category?.name ?? "Sem categoria";
        if (!acc[categoryName]) acc[categoryName] = [];
        acc[categoryName].push(product);
        return acc;
    }, {});
    const sortedCategoryNames = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
    const [observacaoPedido, setObservacaoPedido] = useState("");
    const [enderecodestino, setenderecodestino] = useState("");
    
    const tenant = useTenant();

    return (
        <div style={{ padding: 24, position: "relative" }}>
            {/* Cart Icon */}
            {cartCount > 0 && (
                <>
                    <div
                        onClick={() => setModalOpen(true)}
                        style={{
                            position: "fixed",
                            top: 80, // <--- adjust this to match your header height
                            right: 24,
                            zIndex: 1000,
                            cursor: "pointer",
                        }}
                    >
                        <Badge count={cartCount} size="small" color="#f5222d">
                            <ShoppingCartOutlined style={{ fontSize:30, color: tenant.colors.text}} />
                        </Badge>
                    </div>

                    <Modal
                        open={modalOpen}
                        onCancel={() => setModalOpen(false)}
                        title="Carrinho de Compras"
                        footer={[
                            <Button key="close" onClick={() => handledelete()}>
                                Limpar Carrinho
                            </Button>,
  
                            <Button key="close" onClick={() => setModalOpen(false)}>
                                Fechar
                            </Button>,
                            <Button
                                key="checkout"
                                type="primary"
                                onClick={() => handleOrder()}
                            >
                                Finalizar Pedido
                            </Button>,
                        ]}
                    >
                        {cartItems.length === 0 ? (
                            <p>Seu carrinho está vazio.</p>
                        ) : (
                            <ul style={{ paddingLeft: 20 }}>
                                {cartItems.map((item) => (
                                    <li key={item.id}>
                                        <strong>{item.product?.name || "Produto"}</strong> – Qtd: {item.quantity}
                                    </li>
                                ))}
                            </ul>
                        )
                        
                        } 
                    </Modal>
                </>
            )}

            {/* Lista de Produtos */}
            {sortedCategoryNames.map((category) => (
                <div key={category} style={{ marginBottom: 32 }}>
                    <h2 style={{ color: tenant.colors.text }} >{category}</h2>
                    <Row gutter={[12,12]}>
                        {grouped[category].map((product) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                                <Card
                                    hoverable
                                    cover={<PdfThumbnail url={product.banner} />}
                                    title={product.name}
                                >
                                    <p>{product.description}</p>
                                    <h4>R$ {parseFloat(product.precovenda).toFixed(2)}</h4>

                                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                        <InputNumber
                                            placeholder="Qtd"
                                            min={1}
                                            value={quantidades[product.id as string] || 1}
                                            onChange={(value) =>
                                                handleQuantidadeChange(product.id as string, value)
                                            }
                                            style={{ width: 80 }}
                                        />
                                        <Button
                                            type="primary"
                                            icon={<ShoppingCartOutlined />}
                                            onClick={() => handleCarrinho(product.id as string)}
                                        />
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            ))}
        </div>
    );
}
