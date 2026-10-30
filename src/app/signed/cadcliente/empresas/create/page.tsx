"use client";

import { Create, useForm,  } from "@refinedev/antd";
import { Form, Input, Select , Checkbox, List, Radio} from "antd";
import { useList , useSelect } from "@refinedev/core";
import * as ReactInputMask from "react-input-mask";
import { api } from "@/services/api";
import { getCookieClient } from "@/lib/cookieClient";
const InputMask = ReactInputMask.default;
import { RuleObject } from "antd/es/form";
import type { StoreValue } from "antd/es/form/interface";
import { validateCNPJ } from "@/lib/validatecnpj"; // if you move it out



  interface ITipoEmpresas {
      id: number;
      nome: string;
  }
  type Empresa = { id: string | number; nomefantasia: string };
  
export default function BlogPostEdit() {
 
      const {
        options: empresaOptions,
        query: empresaQuery,
        onSearch: onSearchEmpresa, // para server-side search
      } = useSelect<Empresa>({
        resource: "empresas/related",
        optionLabel: "nomefantasia",
        optionValue: "id",
        // pagination: { mode: "off" }, // opcional: carrega tudo
      });
      
    const { query } = useList<ITipoEmpresas>({
      resource: "tipoempresas", // Replace with your resource name
      pagination: {
        // Set to false to fetch all records
        mode: "off",
      },
    });
    const tagOptions =  query.data?.data.map((tag) => ({
      label: tag.nome, 
      value: tag.id,   
    }));

  const { formProps, form, saveButtonProps } = useForm(
 );

    const baseInitialValues = formProps?.initialValues || {};



    async function fetchAddressByCep(cep: string) {
      console.log("entrei");
      const token = await getCookieClient();

      const data = await api.get("/correios/cep?cep=" + cep,  {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
              }) as any;

      if (data) {

          // Optionally update form fields like:
                  form.setFieldsValue({
                      endereco: data.data?.endereco,
                      cidade: data.data?.cidade,
                      estado: data.data?.estado,
                      pais: data.data?.pais,
                      complemento: data.data?.complemento,
                      bairro: data.data?.bairro
                  });
      } else {
          console.warn("CEP não encontrado");
      }
    }
 
    return (
      <Create saveButtonProps={saveButtonProps}>
      
        <Form {...formProps} layout="vertical" initialValues={  {...baseInitialValues} }>
        <Form.Item
          label="Empresa Pai"
          name="empresapai_id"
          rules={[{ required: true }]}
        >
          <Select
            options={empresaOptions ?? []}  // ✅ usa as options do hook
            loading={empresaQuery.isLoading}
            placeholder="Selecione a empresa"
            listHeight={200}
            dropdownStyle={{ maxHeight: 250, overflowY: "auto" }}
            showSearch
            filterOption={false}           // ✅ deixa o hook fazer a busca
            onSearch={onSearchEmpresa}
          />
        </Form.Item>          <Form.Item label={"Nome Fantasia"} name={["nomefantasia"]} rules={[{required: true, },     ]}>
            <Input />
          </Form.Item>          
          <Form.Item label={"Razao Social"} name={["razaosocial"]} rules={[{required: true, },     ]}>
            <Input />
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
           <Form.Item label={"Inscricao Estadual"} name={["inscrestadual"]} rules={[{required: false}, {
                             pattern: /^\d{2,12}$/,
                             message: "Inscr Estadual inválida",
                         },   ]}>
                      <Input />
           </Form.Item>
 
          <Form.Item label={"Inscr Municipal"} name={["inscrmunicipal"]} rules={[{required: false} , {
                             pattern: /^\d{2,11}$/,
                             message: "Inscr Municipal inválida",
                         },   ]}>
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
         <Form.Item label={"Endereco"} name={["endereco"]} rules={[{required: true, },     ]}>
            <Input />
          </Form.Item>
         <Form.Item label={"Numero"} name={["numero"]} rules={[{required: false, },     ]}>
            <Input />
          </Form.Item>
         <Form.Item label={"Complemento"} name={["complemento"]} rules={[{required: false, },     ]}>
            <Input />
          </Form.Item>
         <Form.Item label={"Bairro"} name={["bairro"]} rules={[{required: true, },     ]}>
            <Input />
          </Form.Item>
         <Form.Item label={"Cidade"} name={["cidade"]} rules={[{required: true, },     ]}>
            <Input />
          </Form.Item>
         <Form.Item label={"Estado"} name={["estado"]} rules={[{required: false, },     ]}>
            <Input />
          </Form.Item>
         <Form.Item label={"Pais"} name={["pais"]} rules={[{required: true, },     ]}>
            <Input />
          </Form.Item>nomefantasia
         <Form.Item label={"Telefone"} name={["telefone"]} rules={[{required: false, },     ]}>
            <Input />
          </Form.Item>
         <Form.Item label={"Telefone 2"} name={["telefone2"]} rules={[{required: false, },     ]}>
            <Input />
          </Form.Item>

          <Form.Item label="Tipos empresa" name="tipoEmpresa"   
            rules={[{ type: "array", required: true, min: 1, message: "Selecione pelo menos um tipo" },
              ]}>
            <Checkbox.Group
              options={tagOptions ?? []}
              disabled={query.isLoading}
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            />            
            </Form.Item> 

        </Form>
      </Create>
    );
 }