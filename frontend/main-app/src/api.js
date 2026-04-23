import axios from "axios";

const gateway = axios.create({
  baseURL: "http://localhost:5050",
  timeout: 10000
});

export const moduleApi = {
  m: (path) => gateway.get(`/api/m${path}`),
  i: (path) => gateway.get(`/api/i${path}`),
  t: (path) => gateway.get(`/api/t${path}`),
  d: (path) => gateway.get(`/api/d${path}`)
};

export default gateway;
