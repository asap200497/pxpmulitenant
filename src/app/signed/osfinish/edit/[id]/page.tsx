"use client";

import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Checkbox } from "antd";
import { useCheckboxGroup } from "@refinedev/antd";

  interface IFuncionalidades {
     funcionalidade: {
      id: string,
      nome: string

     }
    
  }

 export default function BlogPostEdit() {
  
   const { formProps, saveButtonProps } = useForm(
     {
       meta: {
         initialValues: (data: any) => ({
           ...data,
         }),
       },
 
     });

    const baseInitialValues = formProps?.initialValues || {};

    const { checkboxGroupProps } = useCheckboxGroup ({
        resource: "funcionalidades",
        optionLabel: "nome",    // this maps to each item's 'nome'
        optionValue: "id",      // this maps to each item's 'id'
     });
     
 
  const selectedFuncIds = formProps?.initialValues?.funcionalidades.map((g:IFuncionalidades) => g.funcionalidade.id);

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" initialValues={ {...baseInitialValues,funcionalidades: selectedFuncIds}}>
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
    </Edit>
  );
}
