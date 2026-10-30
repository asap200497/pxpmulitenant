"use client";

import {
  DataProvider,
  GetListParams,
  GetListResponse,
  BaseRecord,
} from "@refinedev/core";
import dataProviderSimpleRest from "@refinedev/simple-rest";
import { http } from "@/lib/http";  // << use shared client

const API_URL = process.env.NEXT_PUBLIC_API as string;

// This provider now uses the *same* axios instance with interceptors
const baseProvider = dataProviderSimpleRest(API_URL, http);

export const dataProviderServerside: DataProvider = {
  ...baseProvider,

  async getList<TData extends BaseRecord = BaseRecord>(
    params: GetListParams,
  ): Promise<GetListResponse<TData>> {
    const { resource, pagination, filters } = params;

    let page = pagination?.currentPage || 1;
    let pageSize = pagination?.pageSize || 10;

    const query: Record<string, any> = pagination?.mode == "off" ? {} : { page, pageSize };

    if (filters) {
      filters.forEach((filter, index) => {
        if ("field" in filter && "operator" in filter && "value" in filter) {
          query[`filters[${index}][field]`] = filter.field;
          query[`filters[${index}][operator]`] = filter.operator;
          query[`filters[${index}][value]`] = filter.value;
        }
      });
    }

    // IMPORTANT: use http (shared client), not axios.create()
    const response = await http.get(`/${resource}`, { params: query });

    return {
      data: response.data.data,
      total: response.data.total,
      totalValor: response.data.totalValor,
    };
  },
};
