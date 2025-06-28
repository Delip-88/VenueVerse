import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// Use environment variable for API URL
const apiUrl =
  import.meta.env.MODE === "development"
    ? "http://localhost:4000/graphql"
    : import.meta.env.VITE_GRAPHQL_API;

const httpLink = createHttpLink({
  uri: apiUrl,
  credentials: "include", // Include cookies for authentication
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
