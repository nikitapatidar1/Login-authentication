const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:50001',
      changeOrigin: true,
      ws: true, // WebSockets के लिए
      onProxyReq: (proxyReq) => {
        console.log('Proxying request:', proxyReq.path);
      }
    })
  );
};