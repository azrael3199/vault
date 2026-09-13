// vite.config.ts
import { defineConfig } from "file:///C:/Projects/vault-web/node_modules/.pnpm/vite@5.3.5_@types+node@22.0.0/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Projects/vault-web/node_modules/.pnpm/@vitejs+plugin-react@4.3.1_vite@5.3.5/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { loadEnv } from "file:///C:/Projects/vault-web/node_modules/.pnpm/vite@5.3.5_@types+node@22.0.0/node_modules/vite/dist/node/index.js";
import * as path from "path";
var __vite_injected_original_dirname = "C:\\Projects\\vault-web";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: "",
    plugins: [react()],
    define: {
      "process.env": env
    },
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    server: env.MODE === "development" ? {
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          secure: false
        }
      }
    } : {}
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxQcm9qZWN0c1xcXFx2YXVsdC13ZWJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFByb2plY3RzXFxcXHZhdWx0LXdlYlxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovUHJvamVjdHMvdmF1bHQtd2ViL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCB7IGxvYWRFbnYgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksIFwiXCIpO1xuICByZXR1cm4ge1xuICAgIGJhc2U6IFwiXCIsXG4gICAgcGx1Z2luczogW3JlYWN0KCldLFxuICAgIGRlZmluZToge1xuICAgICAgXCJwcm9jZXNzLmVudlwiOiBlbnYsXG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBzZXJ2ZXI6XG4gICAgICBlbnYuTU9ERSA9PT0gXCJkZXZlbG9wbWVudFwiXG4gICAgICAgID8ge1xuICAgICAgICAgICAgcHJveHk6IHtcbiAgICAgICAgICAgICAgXCIvYXBpXCI6IHtcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IFwiaHR0cDovL2xvY2FsaG9zdDo1MDAwXCIsXG4gICAgICAgICAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfVxuICAgICAgICA6IHt9LFxuICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVQLFNBQVMsb0JBQW9CO0FBQ3BSLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFDeEIsWUFBWSxVQUFVO0FBSHRCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUMzQyxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsSUFDakIsUUFBUTtBQUFBLE1BQ04sZUFBZTtBQUFBLElBQ2pCO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFVLGFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3RDO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFDRSxJQUFJLFNBQVMsZ0JBQ1Q7QUFBQSxNQUNFLE9BQU87QUFBQSxRQUNMLFFBQVE7QUFBQSxVQUNOLFFBQVE7QUFBQSxVQUNSLFFBQVE7QUFBQSxRQUNWO0FBQUEsTUFDRjtBQUFBLElBQ0YsSUFDQSxDQUFDO0FBQUEsRUFDVDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
