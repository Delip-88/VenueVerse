import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { ApolloServer } from "@apollo/server"; 
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";
import { connectDB } from "./config/db.js";
import { authenticate } from "./middleware/authenticate.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

// Import your GraphQL schema and resolvers
import typeDefs from "./graphql/schema.js";
import resolvers from "./graphql/resolvers.js";
import { v2 as cloudinary } from "cloudinary";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Load environment variables from .env file

// Initialize express
const app = express();
const PORT = process.env.PORT || 4000;

// Use cookieParser
app.use(cookieParser());

app.use(helmet());

// Rate Limiting Middleware for basic protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});
app.use(limiter);

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});


// CORS options
const corsOptions = {
  origin: process.env.CLIENT_URL,
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
        return { req, res , user: req.user};
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
