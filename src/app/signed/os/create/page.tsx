"use client";

import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Checkbox } from "antd";
import { useCheckboxGroup } from "@refinedev/antd";

  interface IFuncionalidades {
     
      id: string,
      nome: string
    
  }

export default function BlogPostCreate() {
  const { formProps, saveButtonProps } = useForm(
     {
       meta: {
         initialValues: (data: any) => ({
           ...data,
            grupos: data.grupos?.map((g: any) => g.grupo.id),
         }),
       },
 
     });
    const { checkboxGroupProps } = useCheckboxGroup<IFuncionalidades> ({
        resource: "funcionalidades",
        optionLabel: "nome",    // this maps to each item's 'nome'
        optionValue: "id",      // this maps to each item's 'id'
     });


  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={"Nome"}
          name={["nome"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>


            <Form.Item label="Funcionalidades" name="funcionalidades">
              <Checkbox.Group>
                { <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {checkboxGroupProps.options?.map((option) => (
                    <Checkbox key={option.value} value={option.value}>
                      {option.label}
                    </Checkbox>
                  ))}
                </div> }
              </Checkbox.Group>
            </Form.Item>

        
      </Form>
    </Create>
  );
}
