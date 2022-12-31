import { graphql } from 'graphql';
import {
  makeExecutableSchema,
  addResolveFunctionsToSchema
} from "graphql-tools";
import resolvers from './resolvers';
import schema from './schema';
import path from 'path';

const query = `
query {
  stats {
    modules {
      id
      identifier
      name
      size
      cacheable
      built
      optional
      prefetched
      chunkIds
      issuerId
      issuerName
      failed
      usedExports
      providedExports
      depth
      source
      index
    }
  }
}

`;

function runquery (str: string) {
  return graphql({
    schema,
    rootValue: resolvers,
    source: str,
    contextValue: {
      statsFile: path.resolve(__dirname, 'stats.json')
    }
  });
}

runquery(query).then(data => {
  console.log(data);
})


//example query
// query {
//   webpackStats {
//     modules {
//       name
//       size
//     }
//   }
// }
// query {
//   webpackStats {
//     entrypoints(name: "main") {
//       name
//       assets
//     }
//   }
// }

//query {
//   assets {
//     name
//     size
//   }
//   chunks {
//     id
//     size
//   }
//   modules {
//     id
//     identifier
//     name
//     size
//     cacheable
//     built
//     optional
//     prefetched
//     chunkIds
//     children {
//       id
//       identifier
//       name
//     }
//     issuer {
//       identifier
//       name
//     }
//     chunks {
//       id
//       size
//     }
//   }
// }
//query {
//   modules(chunkId: "0") {
//     identifier
//     name
//     size
//   }
// }
