const Joi = require("joi");
const ProductModel = require("../models/product");
const Model = require("../models/shoppingCart");

exports.createProduct = async (req, res) => {


  const data = validateWithJoi(req.body);
  const images = [];
 
  req.files.forEach(file => {
    const {filename} = file;
    images.push('http://localhost:5000/' + filename);
  })
 

  if (!data.success) return res.status(400).json(data);
  const isExist = await ProductModel.findOne({ ...req.body });
  if (isExist)
    return res
      .status(400)
      .json({ success: false, errorMsg: "This product already created" });

  const products = await ProductModel.find();
  const newProduct = await new ProductModel({
    images,
    ...data.payload,
    id: products.length + 1,
  });
  newProduct.save();

  res.json({ success: true, payload: newProduct });
};

exports.getProducts = async (req, res) => {
  const findedProducts = await ProductModel.find();

  if (!findedProducts || findedProducts.length === 0)
    return res
      .status(404)
      .send({ success: false, errorMsg: "Products not found" });

  res.json({ success: true, payload: findedProducts });
};

exports.addToCart = async (req, res) => {
  const findedProduct = await ProductModel.findOne({ _id: req.params.id });
  const newShoppingCartProduct = await Model.create({
    ...findedProduct,
    owner: req.locals.id,
  });
};

exports.getProductById = async (req, res) => {
  const findedProduct = await ProductModel.findOne({ _id: req.params.id });

  if (!findedProduct || findedProduct.length === 0)
    return res
      .status(404)
      .send({ success: false, errorMsg: "Product not found" });

  res.json({ success: true, payload: findedProduct });
};

exports.deleteProduct = async (req, res) => {
  const result = await ProductModel.deleteOne({ _id: req.params.id });

  if (!result)
    return res
      .status(400)
      .json({ success: false, errorMsg: "Can not delete this Product" });

  res.json({ success: true, payload: result });
};

exports.updateProduct = async (req, res) => {
  const result = await ProductModel.updateOne(req.body);

  if (!result)
    return res
      .status(400)
      .json({ success: false, errorMsg: "Can not update this product" });

  res.json({ success: true, payload: result });
};

exports.getProductsByModel = async (req, res) => {
  const findedProducts = await ProductModel.find({ model: req.query.model });

  if (!findedProducts || findedProducts.length === 0)
    return res
      .status(404)
      .json({ success: false, errorMsg: "Can not find any products" });

  res.json({ success: false, payload: findedProducts });
};

function validateWithJoi(data) {
  const schema = Joi.object({
    model: Joi.string().required(),
    brend: Joi.string().required(),
    rating: Joi.string().required(),
    parent_category: Joi.string().required(),
    product_type: Joi.string().required(),
    description: Joi.string().required(),
    additional_information: Joi.object().required(),
    price: Joi.string().required(),
  });
  const validationResult = schema.validate(data);
  const { error } = validationResult;

  if (error)
    return {
      success: false,
      errorMsg: `${error.details[0].message.replace(/['"','\']/g, "")}`,
    };

  return { success: true, payload: data };
}
