"use client";
import { ITipoEmpresa } from "../../../../../../interfaces"
import { Edit, useForm , useSelect} from "@refinedev/antd";
import { Form, Input, Checkbox, Select , Button } from "antd";


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

    const baseInitialValues = formProps?.initialValues || {};

    return (
      <Edit saveButtonProps={saveButtonProps}>
        
        <Form {...formProps} layout="vertical" initialValues={  {...baseInitialValues} }>
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
                
            
        </Form>
      </Edit>
    );
 }