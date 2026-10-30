"use client";

import { Create, useForm, useSelect, } from "@refinedev/antd";
import { Form, Input, Checkbox} from "antd";
import { useCheckboxGroup } from "@refinedev/antd";
import InputMask from "react-input-mask";
import { validateCPF as validateCPFHelper } from "@/lib/validatecpf";


interface IGrupos {
     
      id: string,
      nome: string
    
}


export default function BlogPostCreate() {
  const { formProps, saveButtonProps } = useForm({});
     const { checkboxGroupProps } = useCheckboxGroup<IGrupos> ({
         resource: "gruposusuario",
         optionLabel: "nome",    // this maps to each item's 'nome'
         optionValue: "id",      // this maps to each item's 'id'
      });
      


  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        {/* <Form.Item
          label={"Login"}
          name={["login"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item> */}
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
        <Form.Item
          label={"Email"}
          name={["email"]}
          rules={[
            {
              required: true,
            },
          ]}>
          <Input />        
          </Form.Item>
                          <Form.Item
          label={"Senha"}
          name={["password"]}
          rules={[
            {
              required: true,
            },
          ]}>
          <Input />        
          </Form.Item>
          <Form.Item label={"Telefone1"} name={["telefone1"]} rules={[{required: true, },     ]}>
            <Input />
          </Form.Item>
          <Form.Item label={"Telefone2"} name={["telefone2"]} rules={[{required: true, },     ]}>
            <Input />
          </Form.Item>
            <Form.Item label="Grupos" name="grupos">
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
