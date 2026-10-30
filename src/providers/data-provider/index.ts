"use client";

import dataProviderSimpleRest from "@refinedev/simple-rest";
import {getCookieClient}  from '@/lib/cookieClient'
import { deleteCookie } from "cookies-next";

const API_URL = "https://api.fake-rest.refine.dev";

import axios from "axios";

// Create a custom axios instance
const axiosInstance = axios.create({

  baseURL: process.env.NEXT_PUBLIC_API

});

// Function to add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Retrieve the token from wherever it's stored
    config.headers.Authorization = `Bearer ${getCookieClient()}`;
    return config;
  },
  (error) => {
    console.log("Request error 3: ");
    return Promise.reject(error);
  }
);


  axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    console.log("response error status:", status);
    if (status === 401) {
      console.log("Got 401 from API, logging out & redirecting");

      // Clean up auth state
      deleteCookie("session");
      deleteCookie("auth");
      if (typeof window !== "undefined") {
        window.location.href = "/"; // go back to login
      }
    }

    return Promise.reject(error);
  },
);


//export const dataProvider =dataProviderSimpleRest(API_URL);

export const dataProvider =dataProviderSimpleRest(process.env.NEXT_PUBLIC_API as string, axiosInstance);


