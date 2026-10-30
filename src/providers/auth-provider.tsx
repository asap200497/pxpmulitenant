// src/providers/auth-provider.ts

import type { AuthProvider } from "@refinedev/core";
import { deleteCookie, setCookie, getCookie } from "cookies-next";

export const authProvider: AuthProvider = {
  async login(params) {
    const username = (params as any)?.username as string | undefined;
    const password = (params as any)?.password as string | undefined;

    // if (username === "admin" && password === "1234") {
    //   setCookie("session", "dummy-session-token");
    //   return { success: true, redirectTo: "/dashboard" };
    // }

    return { success: false, error: new Error("Invalid credentials") };
  },

  async logout() {
    deleteCookie("session");
    return { success: true, redirectTo: "/" };
  },

  async check() {
    const session = getCookie("session");
    return session
      ? { authenticated: true }
      : { authenticated: false, redirectTo: "/" };
  },

  async getIdentity() {
    return { id: "1", name: "Admin User" };
  },

  async getPermissions() {
    return null;
  },

async onError(error) {
  console.log("xxxxxxxxxxxxxxxxxxx")
  // const status = (error as any)?.response?.status;

  // if (status === 401) {
  //   return {
  //     logout: true,
  //     redirectTo: "/", // login page
  //   };
  // }

  return {};
},

};
