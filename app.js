require("dotenv").config();
//async errors
require("express-async-errors");

const express = require("express");
const app = express();
const notFoundMiddleware = require("./middleware/not-found");
const errorMiddleware = require("./middleware/error-handler");
const connectDB = require("./db/connect");
const productsRouter = require("./routes/products");

//middlewares

//middleware for accesing JSON data from req.body
app.use(express.json());

//routes
app.get("/", (req, res) => {
  res.send('<h1>Store API</h1> <a href="/api/v1/products">products route</a>');
});

app.use("/api/v1/products", productsRouter);

//products route

//error handling middleware
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// console.log("04 Store API");

const port = process.env.port || 3000;
const url = process.env.DB_URI;
const start = async () => {
  try {
    await connectDB(url);
    app.listen(port, "localhost", () => {
      console.log(`listening on ${port}... `);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
