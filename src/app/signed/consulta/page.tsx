
import styles from './page.module.scss'
import { api } from  '@/services/api'
import { MateriaisProps } from "@/lib/materiais.type"
import { getCookieClient } from "@/lib/cookieClient"




async function getMateriais():  Promise <MateriaisProps[] | []> {

    try {
        const token = await getCookieClient();
        const response =  await api.get("/materiais", {
             headers: {
                 Authorization : `Bearer ${token}`
             }
        });
        return response.data  ;
    } catch(err) {
        console.log(err);
        return [];
    }

}

export default async function Page() {
    const materiais = await getMateriais();
    const mults = [-1,8,4,2,1,0.5,0.25,0.125];

  
  return (
    <>
      <div className={styles.containerCenter}>
        <section className={styles.login}>
         <h1> Lista de Produtos</h1>
          <form>
            <table>
            <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Pb</th>
                <th>Insumo</th>
                <th>Custo</th>
                <th>MarkUP</th>  
                <th>Padrao</th>

            </tr>
                
            {
                materiais.map((material,index) => (
                  <div key={index}> 
                    <tr>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {material.produto}</td>
                    <td>{material.categoria}</td>
                    <td>{material.precobase}</td>
                    <td>{Number(material.insumo).toFixed(3)}</td>
                    <td>{material.custo }</td>
                    <td>{material.markup}</td>
                    <td>{material.padrao}</td>

                    </tr>
                  </div>
                ))
                            
            }
            </table>
         </form>
        </section>
      </div>
    </>
  )
}