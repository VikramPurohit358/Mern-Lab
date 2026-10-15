import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const fetchOrder = async () => {
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

    useEffect(() => {
        if (id) {
            fetchOrder();
        }
    }, [id]);

    const handleStatusChange = async (newStatus) => {
        try {
            setUpdatingStatus(true);
            const res = await api.patch(`/orders/${id}/status`, { status: newStatus });
            if (res.data.success) {
                setOrder(res.data.order);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update order status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const steps = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
    const currentStepIndex = order ? steps.indexOf(order.status) : -1;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'DELIVERED':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'SHIPPED':
                return 'bg-sky-50 text-sky-700 border-sky-200';
            case 'CONFIRMED':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'PLACED':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'CANCELLED':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <Navbar customer={customer} />

            <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
                {/* Back button */}
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        to="/orders"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600"
                    >
                        <span>←</span>
                        <span>Back to My Orders</span>
                    </Link>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-sm"></div>
                        <p className="mt-4 text-base font-semibold text-slate-600">Loading order details...</p>
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl">
                            ⚠️
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-red-900">Order Not Found</h2>
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                        <Link
                            to="/orders"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                        >
                            View All Orders
                        </Link>
                    </div>
                )}

                {/* Order Details View */}
                {!loading && !error && order && (
                    <div className="space-y-6">
                        {/* Header Box */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
                                <div>
                                    <span className="text-xs font-semibold text-slate-400">Order Number</span>
                                    <h1 className="text-xl font-mono font-black text-slate-900 sm:text-2xl">
                                        #{order._id}
                                    </h1>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={`inline-flex items-center rounded-full px-3.5 py-1 text-xs font-bold border ${getStatusBadge(
                                            order.status
                                        )}`}
                                    >
                                        ● {order.status}
                                    </span>
                                    <span
                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                                            order.paymentStatus === 'PAID'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-amber-100 text-amber-800'
                                        }`}
                                    >
                                        {order.paymentStatus === 'PAID' ? '✓ Paid' : 'Pending Payment'}
                                    </span>
                                </div>
                            </div>

                            {/* Status Progression Tracker (Bonus Feature) */}
                            {order.status !== 'CANCELLED' && order.status !== 'PENDING_PAYMENT' && (
                                <div className="pt-6">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                                        Order Progression
                                    </h3>
                                    <div className="relative">
                                        <div className="grid grid-cols-4 text-center">
                                            {steps.map((step, idx) => (
                                                <div key={step} className="flex flex-col items-center">
                                                    <div
                                                        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-black transition-colors ${
                                                            idx <= currentStepIndex
                                                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                                                : 'border-slate-200 bg-white text-slate-400'
                                                        }`}
                                                    >
                                                        {idx <= currentStepIndex ? '✓' : idx + 1}
                                                    </div>
                                                    <span
                                                        className={`mt-2 text-xs font-semibold ${
                                                            idx <= currentStepIndex
                                                                ? 'text-indigo-600 font-bold'
                                                                : 'text-slate-400'
                                                        }`}
                                                    >
                                                        {step}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quick Dev/Admin Status Simulator (Bonus Feature) */}
                                    <div className="mt-6 rounded-2xl bg-slate-50 p-3 border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                                        <span className="font-semibold text-slate-600">
                                            ⚙️ Update Status (Bonus Demo):
                                        </span>
                                        <div className="flex gap-1.5 flex-wrap">
                                            {steps.map((st) => (
                                                <button
                                                    key={st}
                                                    disabled={updatingStatus || order.status === st}
                                                    onClick={() => handleStatusChange(st)}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                                        order.status === st
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                                    } disabled:opacity-50`}
                                                >
                                                    {st}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Items Snapshot Card */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Items Ordered</h2>
                            <div className="divide-y divide-slate-100">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-16 w-16 rounded-2xl object-cover bg-slate-100 border border-slate-100 shadow-sm"
                                                onError={(e) => {
                                                    e.target.src =
                                                        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';
                                                }}
                                            />
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                                                    {item.name}
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Quantity: {item.quantity} × ₹{item.price?.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <span className="text-base font-black text-slate-900">
                                            ₹{(item.price * item.quantity).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping & Payment Summary Card */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Shipping Details */}
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                                <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <span>📍</span>
                                    <span>Shipping Address</span>
                                </h2>
                                <div className="text-sm text-slate-600 space-y-1">
                                    <p className="font-bold text-slate-900">{order.shippingAddress?.fullName}</p>
                                    <p>{order.shippingAddress?.addressLine1}</p>
                                    <p>
                                        {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
                                        {order.shippingAddress?.pincode}
                                    </p>
                                    <p className="text-xs text-slate-500 pt-1 font-medium">
                                        Phone: {order.shippingAddress?.phone}
                                    </p>
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                                <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <span>💳</span>
                                    <span>Payment Info</span>
                                </h2>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Payment Method</span>
                                        <span className="font-semibold text-slate-900">Razorpay (Test Mode)</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Payment Status</span>
                                        <span className="font-semibold text-emerald-600">{order.paymentStatus}</span>
                                    </div>
                                    {order.razorpayPaymentId && (
                                        <div className="flex justify-between text-slate-600">
                                            <span>Payment ID</span>
                                            <span className="font-mono text-xs font-semibold text-slate-800">
                                                {order.razorpayPaymentId}
                                            </span>
                                        </div>
                                    )}
                                    <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                                        <span className="text-base font-bold text-slate-900">Total Paid</span>
                                        <span className="text-xl font-black text-slate-900">
                                            ₹{order.totalAmount?.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default OrderDetails;
