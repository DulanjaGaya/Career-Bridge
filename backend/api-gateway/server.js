const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.GATEWAY_PORT || 5050;

app.use(cors());
app.use(express.json());

const targets = {
  m: process.env.M_BACKEND_URL || "http://localhost:5001",
  i: process.env.I_BACKEND_URL || "http://localhost:5002",
  t: process.env.T_BACKEND_URL || "http://localhost:5003",
  d: process.env.D_BACKEND_URL || "http://localhost:5004"
};

const moduleProxy = (target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: { "^/api/[midt]": "/api" }
  });

app.use("/api/m", moduleProxy(targets.m));
app.use("/api/i", moduleProxy(targets.i));
app.use("/api/t", moduleProxy(targets.t));
app.use("/api/d", moduleProxy(targets.d));

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    gateway: "Career Bridge API Gateway",
    modules: targets
  });
});

app.listen(PORT, () => {
  console.log(`API gateway running on http://localhost:${PORT}`);
});
