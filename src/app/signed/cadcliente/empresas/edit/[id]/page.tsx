"use client";

import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Checkbox, Select , Button, Switch } from "antd";

import { useList , useSelect } from "@refinedev/core";
import * as ReactInputMask from "react-input-mask";
const InputMask = ReactInputMask.default;
import { RuleObject } from "antd/es/form";
import type { StoreValue } from "antd/es/form/interface";
import { validateCNPJ } from "@/lib/validatecnpj"; // if you move it out


  interface ITipos {
    tipo: {
      id: number;
      nome: string;
    }
  }


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
  
  const { formProps, saveButtonProps } = useForm(
      {resource: "orders"}
 );

    const baseInitialValues = formProps?.initialValues || {};



    const selectedTiposIds = formProps?.initialValues?.tipoEmpresa.map((g:ITipos) => g.tipo.id);
    
    const selectedUsuariosIds =
      formProps?.initialValues?.usuariosEmpresa?.map((g: any) => g.usuario.id) || [];
    return (
      <Edit saveButtonProps={saveButtonProps}>
        
        <Form {...formProps} layout="vertical" initialValues={  {...baseInitialValues,tipoEmpresa: selectedTiposIds , usuariosEmpresa: selectedUsuariosIds} }>
          <Form.Item label={"Nome Fantasia"} name={["nomefantasia"]} rules={[{required: true, },     ]}>
            <Input />
          </Form.Item>          
          <Form.Item label={"Razao Social"} name={["razaosocial"]} rules={[{required: true, },     ]}>
            <Input />
          </Form.Item>
          <Form.Item label={"Habilitada"} name={["habilitada"]} rules={[{required: true, },     ]}>
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
                    <InputMask mask="99999-999">
                        {(inputProps: any) => <input {...inputProps}  />}
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
            <Form.Item label="Pessoas" name="usuariosEmpresa">
              <Checkbox.Group>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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