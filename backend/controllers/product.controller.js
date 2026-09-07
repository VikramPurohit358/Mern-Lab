import mongoose from "mongoose";
import Product from "../models/product.model.js";

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        if (!name || !description || price === undefined || !category || !image || stock === undefined) {
            return res.status(400).json({ message: "Missing required field" });
        }

        const numericPrice = Number(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({ message: "Invalid price" });
        }

        const numericStock = Number(stock);
        if (isNaN(numericStock) || numericStock < 0) {
            return res.status(400).json({ message: "Invalid stock" });
        }

        const product = await Product.create({
            name,
            description,
            price: numericPrice,
            category,
            image,
            stock: numericStock
        });

        return res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getProducts = async (req, res) => {
    try {
        const { search, category, sort } = req.query;
        const filter = {};

        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        if (category && category !== "All" && category !== "All Categories") {
            filter.category = category;
        }

        let sortOption = { createdAt: -1 };
        if (sort === "price_asc") {
            sortOption = { price: 1 };
        } else if (sort === "price_desc") {
            sortOption = { price: -1 };
        }

        const products = await Product.find(filter).sort(sortOption);

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
