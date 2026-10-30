"use client";

import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select } from "antd";


 export default function BlogPostEdit() {
   const { selectProps } = useSelect({
      resource: "listafranqueados",
      optionLabel: "label",
      optionValue: "value",
  });

  
   const { formProps, saveButtonProps } = useForm(
     {
       meta: {
         initialValues: (data: any) => ({
           ...data,
         }),
       },
 
     });

    const baseInitialValues = formProps?.initialValues || {};

     
 
 
  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" initialValues={ {...baseInitialValues}}>
        <Form.Item label="Franqueado" name={["empresa_id"]} rules={[{ required: true }]}>
            <Select {...selectProps} placeholder="Selecione a categoria" />
        </Form.Item>
        <Form.Item
          label={"Serial"}
          name={["serial"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={"Descricao"}
          name={["descricao"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>


      </Form>
    </Edit>
  );
}
