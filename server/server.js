import express from "express";
import cors from "cors";
import morgan from "morgan";
import connect from "./database/conn.js";
import router from "./router/route.js";

const app = express();

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(morgan("tiny"));
app.disable("x-powered-by");

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

const port = 8080;

app.get("/", (req, res) => {
  res.status(201).json("Home GET Request");
});

app.use("/api", router);

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
