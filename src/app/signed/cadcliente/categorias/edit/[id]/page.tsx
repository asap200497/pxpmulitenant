"use client";

import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Checkbox } from "antd";

import { useList } from "@refinedev/core";


interface IEmpresas {
     
      id: string,
      nomefantasia: string
    
}

interface IEmpresasForm {
    empresa: { 
      id: string,
      nomefantasia: string
    }
}



export default function BlogPostEdit() {
 
    const { query } = useList<IEmpresas>({
      resource: "empresas/related", // Replace with your resource name
      pagination: {
        // Set to false to fetch all records
        mode: "off",
      },
    });
    const tagOptions =  query.data?.data.map((tag) => ({
      label: tag.nomefantasia, 
      value: tag.id,   
    }));



  const { formProps, saveButtonProps } = useForm({});
  const baseInitialValues = formProps?.initialValues || {};
    const selectedEmpresasIds = formProps?.initialValues?.empresas.map((g:IEmpresas) => g.id);
    console.log(selectedEmpresasIds);
    return (
      <Edit saveButtonProps={saveButtonProps}>
        
        <Form {...formProps} layout="vertical" initialValues={ {...baseInitialValues,empresas: selectedEmpresasIds}}>

          <Form.Item label={"Nome"} name={["name"]} rules={[ { required: true, },]}>
            <Input />
          </Form.Item>
            <Form.Item label="Empresas" name="empresas">
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