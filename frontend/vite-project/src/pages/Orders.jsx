import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OrderCard from '../components/OrderCard';
import api from '../services/api';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [customer, setCustomer] = useState(null);
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const [userRes, ordersRes] = await Promise.all([
                api.get('/customers/me'),
                api.get('/orders')
            ]);
            setCustomer(userRes.data);
            if (ordersRes.data.success) {
                setOrders(ordersRes.data.orders);
            }
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/login');
            } else {
                setError(err.response?.data?.message || 'Failed to fetch your orders');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <Navbar customer={customer} />

            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                            My Orders
                        </h1>
                        {!loading && !error && orders.length > 0 && (
                            <p className="mt-1 text-sm text-slate-500">
                                {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed so far
                            </p>
                        )}
                    </div>

                    {!loading && !error && orders.length > 0 && (
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-indigo-600"
                        >
                            <span>🛍️</span>
                            <span>Continue Shopping</span>
                        </Link>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-sm"></div>
                        <p className="mt-4 text-base font-semibold text-slate-600">
                            Loading your orders...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="mx-auto max-w-md rounded-3xl border border-red-200 bg-red-50/70 p-8 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl">
                            ⚠️
                        </div>
                        <h3 className="mt-4 text-xl font-bold text-red-900">Unable to load orders</h3>
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                        <button
                            onClick={fetchOrders}
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-95"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && orders.length === 0 && (
                    <div className="mx-auto max-w-md rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-4xl shadow-inner">
                            📦
                        </div>
                        <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
                            You have not placed any orders yet
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                            Once you complete checkout with Razorpay, your order history and live shipping status will appear here.
                        </p>
                        <Link
                            to="/products"
                            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-95"
                        >
                            <span>Start Shopping</span>
                            <span>→</span>
                        </Link>
                    </div>
                )}

                {/* Order Cards List */}
                {!loading && !error && orders.length > 0 && (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <OrderCard key={order._id} order={order} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Orders;
