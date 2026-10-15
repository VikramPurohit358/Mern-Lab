import express from "express";
import {
    createPaymentOrder,
    verifyPayment,
    getMyOrders,
    getOrderById,
    updateOrderStatus
} from "../controllers/order.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-payment-order", isAuthenticated, createPaymentOrder);
router.post("/verify-payment", isAuthenticated, verifyPayment);
router.get("/", isAuthenticated, getMyOrders);
router.get("/:id", isAuthenticated, getOrderById);
router.patch("/:id/status", isAuthenticated, updateOrderStatus);

export default router;
