import express from "express";
import { ApolloServer } from "@apollo/server"; 
import cors from "cors";
import dotenv from "dotenv";
import { expressMiddleware } from "@apollo/server/express4";
import { connectDB } from "./config/db.js";
import { authenticate } from "./middleware/authenticate.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

// Import your GraphQL schema and resolvers
import typeDefs from "./graphql/schema.js";
import resolvers from "./graphql/resolvers.js";

// Load environment variables from .env file
dotenv.config();

// Initialize express
const app = express();
const PORT = process.env.PORT || 4000;

// Use cookieParser
app.use(cookieParser());

// CORS options
const corsOptions = {
  origin: ["http://localhost:3000", "https://sandbox.apollo.dev"],
  credentials: true,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors(corsOptions));

// Initialize Apollo Server with GraphQL
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start the server
const startServer = async () => {
  console.log("Starting server...");

  // Start Apollo Server
  await server.start();
  console.log("Apollo server started");

  // Connect to the database
  await connectDB();
  console.log("Database connected");

  // Apply GraphQL middleware
  app.use(
    "/graphql",
    bodyParser.json(),
    authenticate, // Custom authentication middleware
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        // Add any additional context (e.g., auth token) here
        return { req, res };
      },
    })
  );

  // Start Express app
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/graphql`);
  });
};

// Start the server
startServer().catch((err) => {
  console.error("Error starting server:", err);
});
