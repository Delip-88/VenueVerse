import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ApolloProvider } from "@apollo/client";
import client from "./middleware/ApolloClient.jsx";
import { AuthProvider } from "./middleware/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
    <ApolloProvider client={client}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ApolloProvider>
);
