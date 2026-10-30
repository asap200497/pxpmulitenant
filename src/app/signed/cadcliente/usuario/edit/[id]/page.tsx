"use client";

import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Checkbox } from "antd";
//import { useCheckboxGroup } from "@refinedev/antd";
import { useList } from "@refinedev/core";
import * as ReactInputMask from "react-input-mask";

import { validateCPF as validateCPFHelper } from "@/lib/validatecpf";


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
 
  const { formProps, saveButtonProps} = useForm(
 );
    const { query } = useList<ITag>({
      resource: "gruposusuario", // Replace with your resource name
      pagination: {
        // Set to false to fetch all records
        mode: "off",
      },
    });
    const tagOptions =  query.data?.data.map((tag) => ({
      label: tag.nome, 
      value: tag.id,   
    }));

    const baseInitialValues = formProps?.initialValues || {};

    // const { checkboxGroupProps } = useCheckboxGroup ({
    //    resource: "grupos",
    //    optionLabel: "nome",    // this maps to each item's 'nome'
    //    optionValue: "id",      // this maps to each item's 'id'
    // }); 
    

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
         <Form.Item
           label="CPF"
           name="cpf"
           rules={[
             { required: true, message: "Informe seu CPF" },
             {
               validator: async (_, value) => {
                 const digits = (value || "").replace(/\D/g, "");
                 if (!digits) return Promise.reject("Informe seu CPF");
                 if (digits.length !== 11)
                   return Promise.reject("Digite os 11 dígitos do CPF");
                 if (!validateCPFHelper(digits))
                   return Promise.reject("CPF inválido");
                 return Promise.resolve();
               },
             },
           ]}
         >
          <Input
             size="large"
             placeholder="00000000000"
             inputMode="numeric"
             maxLength={12}
           />
         </Form.Item>
 
 


          <Form.Item label={"E-Mail"} name={["email"]} rules={[{required: true, },     ]}>
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
 