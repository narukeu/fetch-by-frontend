import { DialogPlugin } from "tdesign-react";

import { getToken } from "./token";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type ResponseType = "json" | "text" | "blob" | "arrayBuffer" | "formData";

/**
 * 获取当前用户的认证令牌。
 * @returns 返回当前用户的认证令牌，如果没有认证令牌则返回 null。
 */

/**
 * 执行HTTP请求的通用函数。
 * @param method 请求方法，支持GET、POST、PUT、DELETE和PATCH。
 * @param url 请求的URL。
 * @param data 可选，请求的数据。
 * @param responseType 可选，响应的数据类型，默认为"json"。支持的类型有"json"、"text"、"blob"、"arrayBuffer"和"formData"。
 * @param headers 可选，请求头信息。
 * @param noToken 可选，就算本地存储了 Token 也不携带，默认为 false。
 * @returns 返回一个Promise，解析为请求结果。
 */
export const http = async (
  method: HttpMethod,
  url: string,
  data?: any,
  responseType: ResponseType = "json",
  headers: HeadersInit = { "Content-Type": "application/json; charset=utf-8" },
  noToken: boolean = false
): Promise<any> => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const AUTH_TOKEN = noToken ? null : getToken();

  const config: RequestInit = {
    method,
    headers: new Headers({
      ...headers,
      ...(AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {})
    }),
    ...(data
      ? { body: data instanceof FormData ? data : JSON.stringify(data) }
      : {})
  };

  try {
    const response = await fetch(BASE_URL + url, config);

    if (!response.ok) {
      console.error(`HTTP ${response.status} 错误。`);
      // throw new Error(`HTTP ${response.status} 错误。`);
    }

    let responseData;
    switch (responseType) {
      case "json":
        responseData = await response.json();
        if (responseData.status !== "success") {
          handleErrorResponse(response.status, responseData.message);
        }
        return responseData;
      case "text":
        responseData = await response.text();
        break;
      case "blob":
        responseData = await response.blob();
        break;
      case "arrayBuffer":
        responseData = await response.arrayBuffer();
        break;
      case "formData":
        responseData = await response.formData();
        break;
      default:
        responseData = response;
    }
    return responseData;
  } catch (error) {
    console.error("请求时发生错误", error);
    throw error;
  }
};

/**
 * 处理错误响应
 * @param status HTTP 状态码
 * @param message 错误消息
 */
function handleErrorResponse(status: number, message: string): void {
  const confirmDialog = DialogPlugin({
    header: `HTTP ${status} 错误`,
    body: message,
    confirmBtn: "确定",
    cancelBtn: null,
    zIndex: 9999,
    onConfirm: () => {
      if (status === 401) {
        // 出现了认证错误，所以清除原有的 token 跳转到登录页重新开始。
        window.sessionStorage.removeItem("userAuthToken");
        window.localStorage.removeItem("userAuthToken");
        window.location.href = `${window.location.origin}/auth/login`;
      }
      confirmDialog.hide();
    },
    onClose: () => {
      confirmDialog.hide();
    }
  });
}
