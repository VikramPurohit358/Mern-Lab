import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

function OrderSuccess() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [customer, setCustomer] = useState(null);

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [userRes, orderRes] = await Promise.all([
                    api.get('/customers/me'),
                    api.get(`/orders/${id}`)
                ]);
                setCustomer(userRes.data);
                if (orderRes.data.success) {
                    setOrder(orderRes.data.order);
                } else {
                    setError('Unable to load order details');
                }
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate('/login');
                } else {
                    setError(err.response?.data?.message || 'Order not found');
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrderData();
        }
    }, [id, navigate]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <Navbar customer={customer} />

            <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
                        <p className="mt-4 text-base font-semibold text-slate-600">Loading order confirmation...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl">
                            ⚠️
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-red-900">Order Confirmation Error</h2>
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                        <div className="mt-6 flex justify-center gap-4">
                            <Link
                                to="/orders"
                                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                            >
                                View My Orders
                            </Link>
                            <Link
                                to="/products"
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                )}

                {!loading && !error && order && (
                    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-center text-white sm:p-10">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-md shadow-inner text-4xl">
                                ✅
                            </div>
                            <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                                Order Placed Successfully!
                            </h1>
                            <p className="mt-2 text-sm text-emerald-100 font-medium">
                                Thank you for shopping with ShopKart. Your order has been placed and payment verified.
                            </p>
                        </div>

                        {/* Order Details Body */}
                        <div className="p-6 sm:p-8 space-y-6">
                            {/* Summary Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-sm">
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400">Order ID</span>
                                    <span className="font-mono font-bold text-slate-800 break-all text-xs sm:text-sm">
                                        #{order._id}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400">Status</span>
                                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 mt-0.5">
                                        ● {order.status}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400">Payment</span>
                                    <span className="font-semibold text-emerald-700">
                                        {order.paymentStatus === 'PAID' ? '✓ Paid via Razorpay' : order.paymentStatus}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400">Total Paid</span>
                                    <span className="font-black text-slate-900 text-base">
                                        ₹{order.totalAmount?.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Reference ID if available */}
                            {order.razorpayPaymentId && (
                                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-2.5 text-xs text-indigo-900 flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-medium">Razorpay Payment ID:</span>
                                    <span className="font-mono font-bold">{order.razorpayPaymentId}</span>
                                </div>
                            )}

                            {/* Purchased Items Snapshot */}
                            <div>
                                <h3 className="text-base font-bold text-slate-900 mb-3">Items in this Order</h3>
                                <div className="divide-y divide-slate-100 border-y border-slate-100">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between py-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-14 w-14 rounded-xl object-cover bg-slate-100 border border-slate-100"
                                                    onError={(e) => {
                                                        e.target.src =
                                                            'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';
                                                    }}
                                                />
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-800">{item.name}</h4>
                                                    <p className="text-xs text-slate-500">
                                                        Qty: {item.quantity} × ₹{item.price?.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">
                                                ₹{(item.price * item.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Shipping Address Snapshot */}
                            <div className="rounded-2xl border border-slate-200/70 p-4 bg-slate-50/50">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Delivery Address
                                </h3>
                                <p className="text-sm font-bold text-slate-800">{order.shippingAddress?.fullName}</p>
                                <p className="text-sm text-slate-600 mt-0.5">{order.shippingAddress?.addressLine1}</p>
                                <p className="text-sm text-slate-600">
                                    {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
                                    {order.shippingAddress?.pincode}
                                </p>
                                <p className="text-xs text-slate-500 mt-1 font-medium">
                                    Phone: {order.shippingAddress?.phone}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <Link
                                    to="/orders"
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700 active:scale-95"
                                >
                                    <span>📦 View My Orders</span>
                                </Link>
                                <Link
                                    to="/products"
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-indigo-600 active:scale-95"
                                >
                                    <span>🛍️ Continue Shopping</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default OrderSuccess;
