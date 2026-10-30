"use client";

import { DateField, MarkdownField, Show, TextField } from "@refinedev/antd";
import { useOne, useShow } from "@refinedev/core";
import { Typography } from "antd";

const { Title } = Typography;

interface IFuncionalidades {
    funcionalidade: {
      id: string,
      nome: string
    }
  }

interface IUsuario {
    usuario: {
      id: string,
      login: string
    }
  }

export default function BlogPostShow() {
  const { query } = useShow({});
  const { data, isLoading } = query;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={record?.id} />
      <Title level={5}>{"Nome"}</Title>
      <TextField value={record?.nome} />
      <Title level={5}>{"Funcionalidades"}</Title>
      {record?.funcionalidades?.map((ip: IFuncionalidades, index: number) => (
         <div key={index}>
          <TextField value={ip.funcionalidade.nome} />
         </div>
      ))}
        
      <Title level={5}>{"Usuarios"}</Title>
      
      {record?.usuariosGrupo?.map((ip: IUsuario, index: number) => (
         <div key={index}>
        <TextField value={ip.usuario.login} >
        
          </TextField> </div>
      ))}
    </Show>
  );
}

    //  <TextField value={record?.grupos.map((ip: IGrupos) => ip.grupo.nome).join(",")} />