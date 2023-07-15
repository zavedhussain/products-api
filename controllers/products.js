const Product = require("../models/product");

const getAllProductsStatic = async (req, res) => {
  //with express-async-errors package
  //we dont have to pass error into "next" that express sends
  //to move to next middleware
  //dont have to setup try-catch or async wrapper
  //can throw errors normally and the next middleware will catch it
  const products = await Product.find({
    featured: true,
  });
  res.status(200).json({ products, nbHits: products.length });
};

const getAllProducts = async (req, res) => {
  //filter using req.query
  //cant pass req.query directly as is user-controlled
  //may have params that are not in db
  const { featured, name, company, sort, fields, numericFilters } = req.query;
  //setup query object
  const queryObject = {};
  if (featured) {
    //ensure value of featured is only true or false
    queryObject.featured = featured === "true" ? true : false;
  }
  if (name) {
    //regex to match query name in name field and "i" option for case insensitive
    queryObject.name = { $regex: name, $options: "i" };
  }
  if (company) {
    queryObject.company = company;
  }
  if (numericFilters) {
    //setup map to replace operators with mongodb fields
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<": "$lt",
      "<=": "$lte",
    };

    //setup regex to replace ops with mongodb values
    const regEx = /\b(<|<=|=|>|>=)\b/g;
    //replace when regex matches with an operator with mongodb values
    let filters = numericFilters.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );
    // console.log(filters);

    const options = ["price", "rating"];

    filters = filters.split(",").forEach((item) => {
      //price-$gt-40 is mapped by index
      const [field, operator, value] = item.split("-");
      //added to queryObject if field in options
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });
    // console.log(queryObject);
  }
  //we want to chain other methods to result like "sort"
  //but if we "await" it will return list of products
  let result = Product.find(queryObject);
  //sort
  if (sort) {
    const sortParams = sort.split(",").join(" ");
    result = result.sort(sortParams);
  } else {
    //default sort
    result = result.sort("createdAt");
  }
  //select fields
  if (fields) {
    const fieldParams = fields.split(",").join(" ");
    result = result.select(fieldParams);
  }
  //limit no of items in page
  const limit = Number(req.query.limit) || 10;
  //choose which page to query
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;
  //finally we wait for products to returned
  const products = await result.skip(skip).limit(limit);
  res.status(200).json({ products, nbHits: products.length });
};

module.exports = { getAllProductsStatic, getAllProducts };
