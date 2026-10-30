"use client";
import { ITipoEmpresa } from "../../../../../interfaces"

import { Edit, useForm, useCheckboxGroup, useSelect } from "@refinedev/antd";
import { Form, Input, Checkbox, Select, Button } from "antd";
import { Switch } from "antd/lib";
import { useMemo } from "react";
import * as ReactInputMask from "react-input-mask";
const InputMask = ReactInputMask.default;
import { api } from '@/services/api'
import { getCookieClient} from "@/lib/cookieClient"
import { RuleObject } from "antd/es/form";
import type { StoreValue } from "antd/es/form/interface";
import { validateCNPJ } from "@/lib/validatecnpj"; // if you move it out


interface ICHKOptions {
  label: string,
  value: string
}

export default function BlogPostEdit() {
  const { formProps,form,  saveButtonProps } = useForm();

  const baseInitialValues = formProps?.initialValues || {};

  const { checkboxGroupProps } = useCheckboxGroup({
    resource: "tipoempresas",
    optionLabel: "nome",
    optionValue: "id",
  });

  const { selectProps: tiercompany } = useSelect({
    resource: "tiers",
    optionLabel: "nome",
    optionValue: "id",
  });

  const selectedTiposIds =
    formProps?.initialValues?.tipoEmpresa?.map((g: ITipoEmpresa) => g.tipo.id) || [];
  const selectedUsuariosIds =
    formProps?.initialValues?.usuariosEmpresa?.map((g: any) => g.usuario.id) || [];

  // Find the ID for the "FRANQUEADO" option (by label)
  const franqueadoId = useMemo(() => {
    return checkboxGroupProps.options?.find((o) => String(o.label).toUpperCase() === "FRANQUEADO")?.value;
  }, [checkboxGroupProps.options]);

  // Watch current selection of tipoEmpresa
  const tipoEmpresaWatch = Form.useWatch("tipoEmpresa", formProps.form);

  // Determine if "FRANQUEADO" is selected
  const isFranqueadoSelected = useMemo(() => {
    const selected: string[] = tipoEmpresaWatch ?? selectedTiposIds ?? [];
    return franqueadoId ? selected?.includes(franqueadoId as string) : false;
  }, [tipoEmpresaWatch, selectedTiposIds, franqueadoId]);

      async function fetchAddressByCep(cep: string) {
  
        const token = await getCookieClient();
  
        const data = await api.get("/correios/cep?cep=" + cep,  {
                  headers: {
                      Authorization: `Bearer ${token}`,
                  },
                }) as any;
          console.log(data.data);
        if (data.data) {
  
            // Optionally update form fields like:
                    form.setFieldsValue({
                        endereco: data.data?.endereco,
                        cidade: data.data?.cidade,
                        estado: data.data?.estado,
                        bairro: data.data?.bairro,
                        pais: data.data?.pais,
                        complemento: data.data?.complemento
                    });
        } else {
            console.warn("CEP não encontrado");
        }
      }
    
  

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        initialValues={{
          ...baseInitialValues,
          tipoEmpresa: selectedTiposIds,
          usuariosEmpresa: selectedUsuariosIds,
        }}
      >
        <Form.Item label={"Nome Fantasia"} name={["nomefantasia"]} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={"Razao Social"} name={["razaosocial"]} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={"Habilitada"} name={["habilitada"]} rules={[{ required: true }]}>
          <Switch />
        </Form.Item>
          <Form.Item
            label={"CNPJ"}
            name={["cnpj"]}
            rules={[
              { required: true, message: "CNPJ Obrigatório" },
              {
                pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
                message: "CNPJ inválido (formato)",
              },
              {
                // check-digit validator
                validator: (_: RuleObject, value: StoreValue) => {
                  if (!value) return Promise.resolve(); // 'required' handles empty
                  return validateCNPJ(String(value))
                    ? Promise.resolve()
                    : Promise.reject(new Error("CNPJ inválido (dígito verificador)"));
                },
              },
            ]}
          >
            <InputMask mask="99.999.999/9999-99">
              {(inputProps: any) => <input {...inputProps} />}
            </InputMask>
          </Form.Item>
        <Form.Item
          label={"Inscricao Estadual"}
          name={["inscrestadual"]}
          rules={[
            { required: false },
            { pattern: /^\d{2,12}$/, message: "Inscr Estadual inválida" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={"Inscr Municipal"}
          name={["inscrmunicipal"]}
          rules={[
            { required: false },
            { pattern: /^\d{2,11}$/, message: "Inscr Municipal inválida" },
          ]}
        >
          <Input />
        </Form.Item>

           <Form.Item label={"CEP"} name={["cep"]} rules={[{required: false}, {
                             pattern: /^\d{5}-\d{3}$/,
                             message: "CEP inválido",
                         },   ]}>
            <InputMask
                mask="99999-999"
                onBlur={(e) => {
                    const cep = e.target.value.replace(/\D/g, "");
                    if (cep.length === 8) {
                        fetchAddressByCep(cep);
                    }
                }}
            >
                {(inputProps: any) => <input {...inputProps} />}
            </InputMask>
           </Form.Item>

        <Form.Item label={"Endereco"} name={["endereco"]} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={"Numero"} name={["numero"]}>
          <Input />
        </Form.Item>
        <Form.Item label={"Complemento"} name={["complemento"]}>
          <Input />
        </Form.Item>
        <Form.Item label={"Cidade"} name={["cidade"]} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={"Bairro"} name={["bairro"]} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={"Estado"} name={["estado"]}>
          <Input />
        </Form.Item>
        <Form.Item label={"Telefone"} name={["telefone"]}>
          <Input />
        </Form.Item>
        <Form.Item label={"Telefone 2"} name={["telefone2"]}>
          <Input />
        </Form.Item>
        <Form.Item label={"Ultimo Nr NF"} name={["telefone2"]}>
          <Input />
        </Form.Item>
        <Form.Item label={"Serie NF"} name={["telefone2"]}>
          <Input />
        </Form.Item>

        <Form.Item label="Tipos empresa" name="tipoEmpresa" rules={[{ required: true }]}>
          <Checkbox.Group>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {checkboxGroupProps.options?.map((option) => (
                <Checkbox key={option.value} value={option.value}>
                  {option.label}
                </Checkbox>
              ))}
            </div>
          </Checkbox.Group>
        </Form.Item>

        {/* CEPATENDIDO only when FRANQUEADO is selected */}
        {isFranqueadoSelected && (
          <Form.Item
            label={"CEPs Atendidos separados por virgula"}
            name={["cepsatendidos"]}
            rules={[
              { required: true, message: "Informe o CEP atendido" },
              {
                pattern: /^(\d{1,8})(,\d{1,8})*$/,
                message: "Formato inválido. Use números até 8 dígitos separados por ':'",
              },
            ]}
          >
            <Input placeholder="Ex: 123,456,7890" />
          </Form.Item>
        )}
        <Form.Item name="tier_id" label="Tier (Volume)">
          <Select {...tiercompany} />
        </Form.Item>

        <Form.Item label="Pessoas" name="usuariosEmpresa">
          <Checkbox.Group>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {formProps.initialValues?.usuariosEmpresa?.map((u: any) => (
                <Checkbox key={u.usuario.id} value={u.usuario.id}>
                  {u.usuario.name}
                </Checkbox>
              ))}
            </div>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Edit>
  );
}
