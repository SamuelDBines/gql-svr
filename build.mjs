import { build } from "esbuild";

const shared = {
  entryPoints: ["src/index.ts"],
  platform: "node",
  target: ["node18"],
  sourcemap: true,
  bundle: true,
  external: ["graphql"],
};

await build({
  ...shared,
  format: "esm",
  outfile: "dist/index.mjs",
});

await build({
  ...shared,
  format: "cjs",
  outfile: "dist/index.cjs",
});
