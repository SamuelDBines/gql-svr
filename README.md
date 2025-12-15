# gql-svr

A tiny Node.js loader for `.gql/.graphql` files that supports `#import` and validates fragment usage.

- ✅ `#import` GraphQL files (relative paths)
- ✅ Bundles into a single GraphQL document string
- ✅ Prevents circular imports
- ✅ Detects **unused fragments** and throws (fail fast)

## Install

```bash
npm i gql-svr
# or
yarn add gql-svr
# or
pnpm add gql-svr
