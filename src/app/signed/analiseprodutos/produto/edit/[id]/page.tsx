"use client";

import { ITipoEmpresa } from "../../../../../../interfaces";
import {
  Edit,
  useForm,
} from "@refinedev/antd";
import {
  Form,
  Input,
  InputNumber,
  Table,
  Typography,
  message,
} from "antd";
import { useState } from "react";
import { useTable } from "@refinedev/core";

const { Title, Paragraph } = Typography;

interface Material {
  id: string;
  produto: string;
  price: number;
}

export default function BlogPostEdit() {
  const {
    formProps,
    saveButtonProps,
  } = useForm();

  const [selectedProducts, setSelectedProducts] = useState<Material[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  
const { tableQuery, pageCount, pageSize, currentPage, setCurrentPage } = useTable<Material>({
        resource: "materiais",
        pagination: {
          currentPage: 1, 
          pageSize: 10,
         mode: "client", // "client" or "server"
        },
    });
 const posts = tableQuery?.data?.data ?? [];

  const handleProductSelect = (record: Material, selected: boolean) => {
    setSelectedProducts((prev) =>
      selected
        ? [...prev, record]
        : prev.filter((p) => p.id !== record.id)
    );
  };

  const handleQuantityChange = (productId: string, value: number | null) => {
    if (value !== null) {
      setQuantities((prev) => ({ ...prev, [productId]: value }));
    }
  };

  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      return message.warning("Please select at least one product.");
    }

    const items = selectedProducts.map((product) => ({
      product_id: product.id,
      quantity: quantities[product.id] || 1,
      price: product.price,
    }));



    message.success("Invoice created!");
  };

  const baseInitialValues = formProps.initialValues || {};

  return (
    <Edit saveButtonProps={{ ...saveButtonProps, onClick: handleSubmit }}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Categoria" name="cname">
          <span>{baseInitialValues?.category?.name || "N/A"}</span>
        </Form.Item>

        <Form.Item label="Produto" name="pname">
          <span>{baseInitialValues?.name || "N/A"}</span>
        </Form.Item>
          <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id}>
                      <td>{post.id}</td>
                      <td>{post.produto}</td>
                      <td>{post.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>      <hr />
      <p>Current Page: {currentPage}</p>
      <p>Page Size: {pageSize}</p>
      <button
        onClick={() => {
          setCurrentPage(currentPage - 1);
        }}
        disabled={currentPage < 2}
      >
        Previous Page
      </button>
      <button
        onClick={() => {
          setCurrentPage(currentPage + 1);
        }}
        disabled={currentPage === pageCount}
      >
        Next Page
      </button>
  


      </Form>
    </Edit>
  );
}
