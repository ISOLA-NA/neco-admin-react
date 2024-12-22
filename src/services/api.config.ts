import axios, { InternalAxiosRequestConfig } from "axios";
import { authHeader } from "./authHeader"
const baseUrl = process.env.REACT_APP_URL;

console.log("urlllllllll", baseUrl)

const Api_Path = `${baseUrl}/`;

const httpClient = axios.create({
    baseURL: Api_Path,
    headers: {
        "Content-Type": "application/json",
    },

    withCredentials: true
});

httpClient.defaults.headers.post["Access-Control-Allow-Origin"] = "*";
httpClient.defaults.headers.post["Access-Control-Allow-Methods"] = "*";
httpClient.defaults.headers.post["Access-Control-Allow-Headers"] = "*";

const authInterceptor = (config: InternalAxiosRequestConfig) => {
    config.headers["Authorization"] = authHeader()
    return config;
};

httpClient.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        return Promise.reject(error);
    }
);
httpClient.interceptors.request.use(authInterceptor);

export default httpClient;
