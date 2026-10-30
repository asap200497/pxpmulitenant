
import "server-only";

import { cookies } from "next/headers";


export async function getCookieServer() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    return token || null;
//     const cookieStore = cookies();
//   return new Promise((resolve) =>
//     setTimeout(() => {
//       resolve(cookieStore)
//     }, 1000)
//  )


}
