import bcrypt from "bcrypt";
import Customer from "../models/customer.model.js";
import generateToken from "../utils/generateToken.js";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
};

export const registerCustomer = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;

        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(409).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newCustomer = await Customer.create({
            fullName,
            email,
            password: hashedPassword,
            phone
        });

        const token = generateToken(newCustomer._id);
        res.cookie("token", token, cookieOptions);

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: {
                _id: newCustomer._id,
                fullName: newCustomer.fullName,
                email: newCustomer.email,
                phone: newCustomer.phone
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(customer._id);
        res.cookie("token", token, cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Login successful"
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getProfile = async (req, res) => {
    try {
        return res.status(200).json(req.user);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logoutCustomer = async (req, res) => {
    try {
        res.clearCookie("token", cookieOptions);
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const oldPassword = req.body.oldPassword || req.body.currentPassword;
        const { newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, customer.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid old password" });
        }

        customer.password = await bcrypt.hash(newPassword, 10);
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
