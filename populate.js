require("dotenv").config();
const connectDB = require("./db/connect");
const Product = require("./models/product");

const jsonProducts = require("./products.json");

const url = process.env.DB_URI;
const start = async () => {
  try {
    await connectDB(url);
    //create separate connection for poulating db
    await Product.deleteMany();
    //truncate your collection
    await Product.create(jsonProducts);
    //populate all products in json file
    console.log("----------------DB population success------------");
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
