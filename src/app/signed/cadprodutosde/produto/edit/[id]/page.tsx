"use client";
import { ITipoEmpresa } from "../../../../../../interfaces"
import { Edit, useForm , useSelect} from "@refinedev/antd";
import { Form, Input, InputNumber, Checkbox, Select , Button, Typography } from "antd";
import { useCheckboxGroup } from "@refinedev/antd";
import * as ReactInputMask from "react-input-mask";
const InputMask = ReactInputMask.default;
import { StatusProdutoEnum } from "@/app/constants/statusProduto"

import { api } from '@/services/api'
import { getCookieClient} from "@/lib/cookieClient"


  interface ICHKOptions {
    label: string,
    value: string
  }


export default function BlogPostEdit() {
 
    const { selectProps } = useSelect ({
        resource: "category",
        optionLabel: "name",    // this maps to each item's 'nome'
        optionValue: "id",      // this maps to each item's 'id'
      }); 



    const { formProps, saveButtonProps } = useForm();

    const optionstatus = Object.entries(StatusProdutoEnum).map(([key, value]) => ({
      label: value,
      value : key,
    }));

   const baseInitialValues = formProps?.initialValues || {};

    return (
      <Edit saveButtonProps={saveButtonProps}>
        
        <Form {...formProps} layout="vertical" initialValues={  {...baseInitialValues} }>

        <Form.Item label="Status" name="status" rules={[{ required: true }]}>
          <Select
            options={optionstatus}
            placeholder="Selecione o status"
            listHeight={200}
            dropdownStyle={{ maxHeight: 250, overflowY: "auto" }}
          />
        </Form.Item>
          <Form.Item label="Categoria" name="category_id" rules={[{ required: true }]}>
              <Select
                {...selectProps}
                placeholder="Selecione a categoria"
                listHeight={200} // controls dropdown height
                dropdownStyle={{ maxHeight: 250, overflowY: "auto" }}
                showSearch
                filterOption={(input, option) =>
                   String(option?.label).toLowerCase().includes(input.toLowerCase())
                }
              />           
         </Form.Item>
   
         <Form.Item label={"Nome"} name={["name"]} rules={[{required: false, },     ]}>
            <Input />
          </Form.Item>
          <Form.Item label="Descricao" name="description">
                <Input.TextArea rows={4} placeholder="Digite aqui..." />
          </Form.Item>                
          <Form.List name="prices">
              {(fields) => (
                  <>

                      {[...fields].map(({ key, name, ...restField }) => ( 
                          <div key={key} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                              <Form.Item
                                  {...restField}
                                  name={[name, "nivel"]}
                                  rules={[{ required: true, message: "Nivel" }]}
                                  style={{ flex: 1 }}
                              >
                                <Typography.Text>Nivel {formProps?.initialValues?.prices?.[name]?.nivel || "N/A"}</Typography.Text>
                              </Form.Item>
                              <Form.Item
                                  {...restField}
                                  name={[name, "price"]}
                                  rules={[{ required: true, message: "Valor Filial" }]}
                                  style={{ flex: 1 }}
                              >
                              <InputNumber
                                  style={{ width: "100%" }}
                                  min={0}
                                  step={0.01}
                                  stringMode // 👈 important to preserve decimal precision
                                  placeholder="Digite o valor"
                              />
                             </Form.Item>
                          </div>
                      ))}
                  </>
              )}
          </Form.List>
          <Form.Item label="Preco Internet" name="precointernet"  rules={[{ required: true, message: "Valor Filial" }]}
                                  style={{ flex: 1 }}>
                <InputNumber
                style={{ width: "100%" }}
                min={0}
                step={0.01}
                stringMode // 👈 important to preserve decimal precision
                placeholder="Digite o valor"
                />
          </Form.Item>   
        </Form>
      </Edit>
    );
 }