export  interface MenuAcesso {
    texto: string,
    link: string,
    submenu: {
      texto: string,
      link: string
    }[]
  }
