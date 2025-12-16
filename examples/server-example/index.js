const { loadGql } = require("gql-svr");

const schema = loadGql("./schema/query.gql");

console.log("Loaded schema:", schema);
