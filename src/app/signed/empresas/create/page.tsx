"use client";

import { Create, useForm, useSelect, useCheckboxGroup } from "@refinedev/antd";
import { Form, Input, Select, Checkbox } from "antd";
import * as ReactInputMask from "react-input-mask";
const InputMask = ReactInputMask.default;
import { api } from "@/services/api";
import { getCookieClient } from "@/lib/cookieClient";
import { RuleObject } from "antd/es/form";
import type { StoreValue } from "antd/es/form/interface";
import { validateCNPJ } from "@/lib/validatecnpj";
import { validateCPF } from "@/lib/validatecpf";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'

function formatCPF(digits: string) {
  const d = digits.slice(0, 11);
  const p1 = d.slice(0, 3);
  const p2 = d.slice(3, 6);
  const p3 = d.slice(6, 9);
  const p4 = d.slice(9, 11);

  let res = "";
  if (p1) res = p1;
  if (p2) res += "." + p2;
  if (p3) res += "." + p3;
  if (p4) res += "-" + p4;
  return res;
}

function formatCNPJ(digits: string) {
  const d = digits.slice(0, 14);
  const p1 = d.slice(0, 2);
  const p2 = d.slice(2, 5);
  const p3 = d.slice(5, 8);
  const p4 = d.slice(8, 12);
  const p5 = d.slice(12, 14);

  let res = "";
  if (p1) res = p1;
  if (p2) res += "." + p2;
  if (p3) res += "." + p3;
  if (p4) res += "/" + p4;
  if (p5) res += "-" + p5;
  return res;
}

function formatDoc(digits: string) {
  const clean = digits.replace(/\D/g, "").slice(0, 14); // máx 14
  if (clean.length <= 11) {
    return formatCPF(clean);
  }
  return formatCNPJ(clean);
}

export default function BlogPostEdit() {
  const { formProps, form, saveButtonProps } = useForm();
      const router =  useRouter();

  const baseInitialValues = formProps?.initialValues || {};

  const { selectProps: tiercompany } = useSelect({
    resource: "tiers",
    optionLabel: "nome",
    optionValue: "id",
  });

  const handleSubmit = async (values: any) => {
      console.log("Form values on finish:", values);

      const token = await getCookieClient();

      const empresa =  await api.post("/empresas", values, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }});
      console.log("Empresa criada:", empresa.data);
      router.push(`/signed/usuario/create?id_empresa=${empresa.data.id}`);

  }

  const { checkboxGroupProps } = useCheckboxGroup({
    resource: "tipoempresas",
    optionLabel: "nome",
    optionValue: "id",
  });

  // ---- NEW: controlled value for CPF/CNPJ field ----
  const [docValue, setDocValue] = useState<string>("");

  // Initialize docValue from initialValues (edit mode)
  useEffect(() => {
    if (baseInitialValues.cnpj) {
      const formatted = formatDoc(String(baseInitialValues.cnpj));
      setDocValue(formatted);
      form.setFieldsValue({ cnpj: formatted });
    }
  }, [baseInitialValues.cnpj, form]);

  async function fetchAddressByCep(cep: string) {
    const token = await getCookieClient();

    const data = (await api.get("/correios/cep?cep=" + cep, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })) as any;

    if (data.data) {
      form.setFieldsValue({
        endereco: data.data?.endereco,
        cidade: data.data?.cidade,
        estado: data.data?.estado,
        bairro: data.data?.bairro,
        pais: data.data?.pais,
        complemento: data.data?.complemento,
      });
    } else {
      console.warn("CEP não encontrado");
    }
  }

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ ...baseInitialValues }}
      >
        <Form.Item
          label={"Nome Fantasia"}
          name={["nomefantasia"]}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={"Razao Social"}
          name={["razaosocial"]}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        {/* ---- CPF/CNPJ auto-detect, sem react-input-mask ---- */}
        <Form.Item
          label={"CNPJ / CPF"}
          name={["cnpj"]}
          rules={[
            {
              required: true,
              message: "Documento obrigatório",
            },
            {
              validator: (_: RuleObject, value: StoreValue) => {
                if (!value) return Promise.resolve();

                const raw = String(value).replace(/\D/g, "");

                if (raw.length === 11) {
                  // CPF
                  return validateCPF(raw)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error("CPF inválido (dígito verificador)")
                      );
                }

                if (raw.length === 14) {
                  // CNPJ
                  return validateCNPJ(raw)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error("CNPJ inválido (dígito verificador)")
                      );
                }

                return Promise.reject(
                  new Error(
                    "Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos numéricos"
                  )
                );
              },
            },
          ]}
        >
          <Input
            value={docValue}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              const formatted = formatDoc(digits);
              setDocValue(formatted);
              form.setFieldsValue({ cnpj: formatted });
            }}
          />
        </Form.Item>

        <Form.Item
          label={"Inscricao Estadual"}
          name={["inscrestadual"]}
          rules={[
            { required: false },
            {
              pattern: /^\d{2,12}$/,
              message: "Inscr Estadual inválida",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={"Inscr Municipal"}
          name={["inscrmunicipal"]}
          rules={[
            { required: false },
            {
              pattern: /^\d{2,11}$/,
              message: "Inscr Municipal inválida",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={"CEP"}
          name={["cep"]}
          rules={[
            { required: false },
            {
              pattern: /^\d{5}-\d{3}$/,
              message: "CEP inválido",
            },
          ]}
        >
          <InputMask
            mask="99999-999"
            onBlur={(e: any) => {
              const cep = e.target.value.replace(/\D/g, "");
              if (cep.length === 8) {
                fetchAddressByCep(cep);
              }
            }}
          >
            {(inputProps: any) => <input {...inputProps} />}
          </InputMask>
        </Form.Item>

        <Form.Item
          label={"Endereco"}
          name={["endereco"]}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label={"Numero"} name={["numero"]}>
          <Input />
        </Form.Item>

        <Form.Item label={"Complemento"} name={["complemento"]}>
          <Input />
        </Form.Item>

        <Form.Item
          label={"Bairro"}
          name={["bairro"]}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={"Cidade"}
          name={["cidade"]}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label={"Estado"} name={["estado"]}>
          <Input />
        </Form.Item>

        <Form.Item
          label={"Pais"}
          name={["pais"]}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        {/* CÓDIGO ÁREA 1 */}
        <Form.Item
          label="Cod Área"
          name="codigoarea"
          rules={[
            { required: true, message: "Código de área obrigatório" },
            {
              pattern: /^\d{2}$/,
              message: "Código de área deve ter exatamente 2 dígitos",
            },
          ]}
        >
          <Input
            maxLength={2}
            onChange={(e) => {
              const onlyNum = e.target.value.replace(/\D/g, "").slice(0, 2);
              form.setFieldsValue({ codigoarea: onlyNum });
            }}
          />
        </Form.Item>

        {/* TELEFONE 1 */}
        <Form.Item
          label="Telefone"
          name="telefone"
          rules={[
            { required: true, message: "Telefone obrigatório" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                const digits = value.replace(/\D/g, "");
                if (digits.length === 8 || digits.length === 9) return Promise.resolve();
                return Promise.reject(
                  new Error("Telefone deve ter 8 ou 9 dígitos numéricos")
                );
              },
            },
          ]}
        >
          <Input
            maxLength={10}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 9);

              let formatted = "";
              if (digits.length <= 4) {
                formatted = digits;
              } else if (digits.length === 5) {
                // 99999-*
                formatted = digits.slice(0, 5) + "-" + digits.slice(5);
              } else if (digits.length >= 6) {
                // 9999-9999 or 99999-9999
                const firstPart = digits.length === 8 ? digits.slice(0, 4) : digits.slice(0, 5);
                const lastPart = digits.length === 8 ? digits.slice(4) : digits.slice(5);
                formatted = firstPart + "-" + lastPart;
              }

              form.setFieldsValue({ telefone: formatted });
            }}
          />
        </Form.Item>

        {/* CÓDIGO ÁREA 2 */}
        <Form.Item
          label="Cod Área 2"
          name="codigoarea2"
          rules={[
            {
              pattern: /^\d{2}$/,
              message: "Código de área deve ter exatamente 2 dígitos",
            },
          ]}
        >
          <Input
            maxLength={2}
            onChange={(e) => {
              const onlyNum = e.target.value.replace(/\D/g, "").slice(0, 2);
              form.setFieldsValue({ codigoarea2: onlyNum });
            }}
          />
        </Form.Item>

        {/* TELEFONE 2 */}
        <Form.Item
          label="Telefone 2"
          name="telefone2"
          rules={[
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                const digits = value.replace(/\D/g, "");
                if (digits.length === 0) return Promise.resolve(); // optional
                if (digits.length === 8 || digits.length === 9) return Promise.resolve();
                return Promise.reject(
                  new Error("Telefone deve ter 8 ou 9 dígitos numéricos")
                );
              },
            },
          ]}
        >
          <Input
            maxLength={10}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 9);

              let formatted = "";
              if (digits.length <= 4) {
                formatted = digits;
              } else if (digits.length === 5) {
                formatted = digits.slice(0, 5) + "-" + digits.slice(5);
              } else if (digits.length >= 6) {
                const firstPart = digits.length === 8 ? digits.slice(0, 4) : digits.slice(0, 5);
                const lastPart = digits.length === 8 ? digits.slice(4) : digits.slice(5);
                formatted = firstPart + "-" + lastPart;
              }

              form.setFieldsValue({ telefone2: formatted });
            }}
          />
        </Form.Item>

        {/* PESSOA DE CONTATO */}
        <Form.Item label="Pessoa Contato" name="contato">
          <Input />
        </Form.Item>

        {/* EMAIL CONTATO */}
        <Form.Item
          label="Email Contato"
          name="emailcontato"
          rules={[
            { type: "email", message: "Email inválido" },
            // { required: true, message: "Email obrigatório" },  // enable if required
          ]}
        >
          <Input />
        </Form.Item>



        <Form.Item name="tier_id" label="Tier (Volume)">
          <Select {...tiercompany} />
        </Form.Item>

        <Form.Item
          label="Tipos empresa"
          name="tipoEmpresa"
          rules={[{ required: true }]}
        >
          <Checkbox.Group>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {checkboxGroupProps.options?.map((option) => (
                <Checkbox key={option.value} value={option.value}>
                  {option.label}
                </Checkbox>
              ))}
            </div>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Create>
  );
}
