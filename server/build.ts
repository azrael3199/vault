import { build } from "esbuild";

build({
  entryPoints: ["index.ts"],
  outfile: "dist/bundle.js",
  bundle: true,
  platform: "node",
  target: "node18",
  loader: { ".html": "text" },
  external: ["mock-aws-s3", "aws-sdk", "nock"],
}).catch(() => process.exit(1));
