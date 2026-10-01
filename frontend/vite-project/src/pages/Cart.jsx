import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CartItem from '../components/CartItem';
import { useCart } from '../context/CartContext';
import api from '../services/api';

function Cart() {
    const { cart, loading, error, subtotal, totalItems, fetchCart } = useCart();
    const [customer, setCustomer] = useState(null);
    const [checkingOut, setCheckingOut] = useState(false);
    const navigate = useNavigate();

    // Check user authentication
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/customers/me');
                setCustomer(res.data);
            } catch (err) {
                navigate('/login');
            }
        };
        fetchUser();
    }, [navigate]);

    const handleCheckout = () => {
        setCheckingOut(true);
        setTimeout(() => {
            setCheckingOut(false);
            alert('Checkout feature will be enabled in Lab-06! Cart subtotal: ₹' + subtotal.toLocaleString());
        }, 800);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <Navbar customer={customer} />

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                            My Cart
                        </h1>
                        {!loading && !error && cart.length > 0 && (
                            <p className="mt-1 text-sm text-slate-500">
                                {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
                            </p>
                        )}
                    </div>

                    {!loading && !error && cart.length > 0 && (
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-indigo-600"
                        >
                            <span>←</span>
                            <span>Continue Shopping</span>
                        </Link>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-sm"></div>
                        <p className="mt-4 text-base font-semibold text-slate-600">
                            Loading your cart...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="mx-auto max-w-md rounded-3xl border border-red-200 bg-red-50/70 p-8 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl">
                            ⚠️
                        </div>
                        <h3 className="mt-4 text-xl font-bold text-red-900">Unable to load your cart.</h3>
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                        <button
                            onClick={fetchCart}
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-95"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && cart.length === 0 && (
                    <div className="mx-auto max-w-md rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-4xl shadow-inner">
                            🛒
                        </div>
                        <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
                            Your cart is empty
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                            Looks like you haven't added anything yet. Start exploring great deals on ShopKart.
                        </p>
                        <Link
                            to="/products"
                            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-95"
                        >
                            <span>Browse Products</span>
                        </Link>
                    </div>
                )}

                {/* Cart Items & Order Summary Layout */}
                {!loading && !error && cart.length > 0 && (
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
                        {/* Cart Items List */}
                        <div className="space-y-4 lg:col-span-8">
                            {cart.map((item) => (
                                <CartItem key={item.product?._id} item={item} />
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-4 sticky top-24">
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-900">
                                    Order Summary
                                </h2>

                                <div className="mt-6 space-y-3 border-b border-slate-100 pb-6 text-sm">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Total Items</span>
                                        <span className="font-semibold text-slate-900">{totalItems} units</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Subtotal</span>
                                        <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Shipping</span>
                                        <span className="font-semibold text-emerald-600">FREE</span>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-base font-bold text-slate-900">Order Total</span>
                                    <span className="text-2xl font-black text-slate-900">
                                        ₹{subtotal.toLocaleString()}
                                    </span>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={checkingOut || cart.length === 0}
                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {checkingOut ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Proceed to Checkout</span>
                                            <span>→</span>
                                        </>
                                    )}
                                </button>

                                <div className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <span>🛡️</span>
                                        <span>Secure 256-bit SSL encrypted checkout</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>⚡</span>
                                        <span>Instant order confirmation</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>🔄</span>
                                        <span>Easy 7-day return policy</span>
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

export default Cart;
