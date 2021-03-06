import { isProduction } from './../../env';
import { ApolloServer } from 'apollo-server-micro';

import { createContext } from '../../graphql/context';
import { schema } from '../../graphql/schema';

export const GRAPHQL_PATH = '/api/graphql';

// this config block is REQUIRED on Vercel! It stops the body of incoming HTTP requests from being parsed
export const config = {
  api: {
    bodyParser: false,
  },
};

export const server = new ApolloServer({
  formatError: (error) => {
    const errorObject = {
      message: error.message,
      statusCode: error.extensions?.code,
    };

    console.log('GraphQL Error -- ', errorObject);

    return errorObject;
  },
  schema,
  playground: !isProduction(),
  introspection: true,
  context: createContext,
  cacheControl: true,
});

export default server.createHandler({ path: GRAPHQL_PATH });
