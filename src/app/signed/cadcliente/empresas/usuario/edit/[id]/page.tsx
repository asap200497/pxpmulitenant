"use client";

import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Checkbox } from "antd";
//import { useCheckboxGroup } from "@refinedev/antd";
import { useList } from "@refinedev/core";
import * as ReactInputMask from "react-input-mask";
const InputMask = ReactInputMask.default;

  interface IGrupos {
     grupo: {
      id: string,
      nome: string

     }
    
  }

    interface ITag {
      id: number;
      nome: string;
  }

export default function BlogPostEdit() {
 
  const { formProps, saveButtonProps } = useForm(
 );

    const baseInitialValues = formProps?.initialValues || {};

    const { query } = useList<ITag>({
      resource: "grupos", // Replace with your resource name
      pagination: {
        // Set to false to fetch all records
        mode: "off",
      },
    });
    const tagOptions =  query.data?.data.map((tag) => ({
      label: tag.nome, 
      value: tag.id,   
    }));


    const selectedGrupoIds = formProps?.initialValues?.grupos.map((g:IGrupos) => g.grupo.id);

    return (
      <Edit saveButtonProps={saveButtonProps}>
        
        <Form {...formProps} layout="vertical" initialValues={ {...baseInitialValues,grupos: selectedGrupoIds}}>
          <Form.Item
            label={"Login"}
            name={["login"]}
            rules={[
              {
                
              },
            ]}
          >
            <Input disabled/>
          </Form.Item>
          <Form.Item label={"Nome"} name={["name"]} rules={[ { required: true, },]}>
            <Input />
          </Form.Item>
          <Form.Item label={"CPF"} name={["cpf"]} rules={[{required: true, message : "CNPJ Obrigatorio"}, {
                            pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                            message: "CNPJ inválido",
                        },   ]}>
                    <InputMask mask="999.999.999-99">
                        {(inputProps: any) => <input {...inputProps}  />}
                    </InputMask>
          </Form.Item>



          <Form.Item label={"E-Mail"} name={["telefone1"]} rules={[{required: true, },     ]}>
            <Input />
          </Form.Item>
          <Form.Item label={"Telefone1"} name={["telefone1"]} rules={[{required: true, },     ]}>
            <Input />
          </Form.Item>
          <Form.Item label={"Telefone2"} name={["telefone2"]} rules={[{required: true, },     ]}>
            <Input />
          </Form.Item>

            <Form.Item label="Grupos" name="grupos">
            <Checkbox.Group
              options={tagOptions ?? []}
              disabled={query.isLoading}
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            />
            </Form.Item>

        </Form>
      </Edit>
    );
 }