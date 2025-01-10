import express from "express";
import cors from "cors";
import morgan from "morgan";
import connect from "./database/conn.js"; // Assuming you have this file for DB connection
import router from "./router/route.js"; // Assuming you have routes defined in this file

const app = express();

// Middlewares
app.use(express.json({ limit: "10mb" })); // Increase the payload size limit to 10MB
app.use(morgan("tiny")); // Log HTTP requests
app.disable("x-powered-by"); // Hide stack information from attackers

// CORS configuration to allow requests only from localhost:3000
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    credentials: true, // Allow cookies to be sent
  }),
);

const port = 8080;

// HTTP GET Request to Home
app.get("/", (req, res) => {
  res.status(201).json("Home GET Request");
});

// API routes
app.use("/api", router);

// Start server only when DB connection is valid
connect()
  .then(() => {
    try {
      app.listen(port, () => {
        console.log(`Server connected to http://localhost:${port}`);
      });
    } catch (error) {
      console.error("Cannot connect to the server:", error);
    }
  })
  .catch((error) => {
    console.error("Invalid database connection...!", error);
  });
