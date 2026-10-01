import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.stock < 1) {
            return res.status(400).json({ message: "Product is out of stock" });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!customer.cart) {
            customer.cart = [];
        }

        const itemIndex = customer.cart.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            customer.cart.push({
                product: productId,
                quantity: 1
            });
        } else {
            const currentQty = customer.cart[itemIndex].quantity;
            if (currentQty + 1 > product.stock) {
                return res.status(400).json({
                    message: `Cannot add more. Only ${product.stock} units available in stock`
                });
            }
            customer.cart[itemIndex].quantity = currentQty + 1;
        }

        await customer.save();

        const updatedCustomer = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name description price category image stock"
        });

        const validCart = (updatedCustomer.cart || []).filter((item) => item.product !== null);

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: validCart
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name description price category image stock"
        });

        if (!customer) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const validCart = (customer.cart || []).filter((item) => item.product !== null);

        return res.status(200).json({
            success: true,
            cart: validCart
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const numericQty = Number(quantity);
        if (isNaN(numericQty) || quantity === undefined || quantity === null) {
            return res.status(400).json({ message: "Quantity must be a valid number" });
        }

        if (numericQty < 1) {
            return res.status(400).json({ message: "Quantity cannot be less than 1" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (numericQty > product.stock) {
            return res.status(400).json({
                message: `Cannot exceed available stock (${product.stock} units available)`
            });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!customer.cart) {
            customer.cart = [];
        }

        const itemIndex = customer.cart.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Product not in cart" });
        }

        customer.cart[itemIndex].quantity = numericQty;
        await customer.save();

        const updatedCustomer = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name description price category image stock"
        });

        const validCart = (updatedCustomer.cart || []).filter((item) => item.product !== null);

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: validCart
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!customer.cart) {
            customer.cart = [];
        }

        const itemIndex = customer.cart.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Product not in cart" });
        }

        customer.cart.splice(itemIndex, 1);
        await customer.save();

        const updatedCustomer = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name description price category image stock"
        });

        const validCart = (updatedCustomer.cart || []).filter((item) => item.product !== null);

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: validCart
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
