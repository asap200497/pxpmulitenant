"use client";

import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
import { useCheckboxGroup , } from "@refinedev/antd";

  interface IFuncionalidades {
     
      id: string,
      nome: string
    
  }



export default function DeviceCreate() {


  const { selectProps } = useSelect({
      resource: "listafranqueados",
      optionLabel: "label",
      optionValue: "value",
  });

  console.log("select", selectProps);
  const { formProps, saveButtonProps } = useForm();
 

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
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
    </Create>
  );
}
