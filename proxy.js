const { createProxyMiddleware } = require("http-proxy-middleware");
const express = require("express");
const app = express();

app.use(
  "/api",
  createProxyMiddleware({
    target: "https://api.sms-man.com/control",
    changeOrigin: true,
    pathRewrite: {
      "^/api": "",
    },
  })
);

app.listen(4000, () => {
  console.log("Proxy server is running on http://localhost:4000");
});
