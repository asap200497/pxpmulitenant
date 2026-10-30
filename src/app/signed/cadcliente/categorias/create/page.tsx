"use client";

import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Checkbox} from "antd";
import { useList } from "@refinedev/core";


  interface IEmpresas {
     empresa: {
      id: string,
      nomefantasia: string

     }
    
  }


  interface ITag {
      id: number;
      nomefantasia: string;
  }



export default function BlogPostCreate() {
  const { formProps, saveButtonProps } = useForm({});

    const { query } = useList<ITag>({
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
   

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
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
    </Create>
  );
}
