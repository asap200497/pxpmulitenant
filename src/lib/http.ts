// src/lib/http.ts
"use client";

import axios from "axios";

import { deleteCookie } from "cookies-next";
import { getCookieClient } from '@/lib/cookieClient'

import { message } from "antd";


export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
});

// Attach interceptors once
http.interceptors.request.use(
  (config) => {
    // You can read from cookie or localStorage; pick one.
    // Example: JWT stored in "session" cookie read by JS:
    const token = getCookieClient();

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

//    console.log("request to", config.url, "with token:", token);
    return config;
  },
  (error) => {
    console.error("request setup error:", error);
    return Promise.reject(error);
  },
);

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
  //  console.log("response error status:", status);

    //Clean client-side auth state (cookies + localStorage)
  if (status === 401) {
      message.error("Sessão expirada. Faça login novamente.");

      // wait 2 seconds so the user can read it
      setTimeout(() => {
        deleteCookie("session");
        deleteCookie("auth");
        window.location.href = "/";
      }, 3000);
    }
    return Promise.reject(error);
  },
);
