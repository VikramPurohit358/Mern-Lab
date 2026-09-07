import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

function Home() {
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/customers/me');
                setCustomer(response.data);
            } catch (error) {
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                    <p className="text-sm font-medium text-slate-500">Loading your profile...</p>
                </div>
            </div>
        );
    }

    const initials = customer?.fullName
        ? customer.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : 'SK';

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar customer={customer} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-8 sm:p-12 text-white shadow-xl shadow-indigo-500/10 mb-8">
                    <div className="relative z-10 max-w-2xl">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                            ✨ Customer Dashboard
                        </span>
                        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                            Welcome back, {customer?.fullName}!
                        </h1>
                        <p className="mt-3 text-base text-indigo-100 sm:text-lg">
                            Manage your account details, track your orders, and explore exclusive member deals on ShopKart.
                        </p>
                    </div>

                    <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-2xl"></div>
                    <div className="absolute right-32 -top-10 h-48 w-48 rounded-full bg-purple-400/20 blur-xl"></div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                            <div className="flex flex-col items-center text-center">
                                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-3xl font-bold text-white shadow-lg shadow-indigo-500/25">
                                    {initials}
                                </div>
                                <h2 className="mt-4 text-xl font-bold text-slate-900">{customer?.fullName}</h2>
                                <p className="text-sm text-slate-500">{customer?.email}</p>
                                <span className="mt-3 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                                    ● Active Customer
                                </span>
                            </div>

                            <div className="mt-6 border-t border-slate-100 pt-6 space-y-4">
                                <div>
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Full Name
                                    </span>
                                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{customer?.fullName}</p>
                                </div>

                                <div>
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Email Address
                                    </span>
                                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{customer?.email}</p>
                                </div>

                                <div>
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Phone Number
                                    </span>
                                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{customer?.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-500">Total Orders</span>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        📦
                                    </div>
                                </div>
                                <p className="mt-3 text-2xl font-bold text-slate-900">0</p>
                                <span className="mt-1 text-xs text-slate-400">No active orders</span>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-500">Wishlist Items</span>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                                        ❤️
                                    </div>
                                </div>
                                <p className="mt-3 text-2xl font-bold text-slate-900">0</p>
                                <span className="mt-1 text-xs text-slate-400">Saved items</span>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-500">Reward Points</span>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                        ⭐
                                    </div>
                                </div>
                                <p className="mt-3 text-2xl font-bold text-slate-900">100</p>
                                <span className="mt-1 text-xs text-emerald-600 font-medium">Welcome bonus</span>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Shortcuts</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <button
                                    onClick={() => navigate('/products')}
                                    className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-center transition hover:bg-indigo-50/60 hover:border-indigo-100 cursor-pointer"
                                >
                                    <span className="text-2xl mb-2">🛍️</span>
                                    <span className="text-sm font-semibold text-slate-800">Browse Store</span>
                                </button>
                                <button className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-center transition hover:bg-indigo-50/60 hover:border-indigo-100">
                                    <span className="text-2xl mb-2">📍</span>
                                    <span className="text-sm font-semibold text-slate-800">Addresses</span>
                                </button>
                                <button className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-center transition hover:bg-indigo-50/60 hover:border-indigo-100">
                                    <span className="text-2xl mb-2">💳</span>
                                    <span className="text-sm font-semibold text-slate-800">Payments</span>
                                </button>
                                <button className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-center transition hover:bg-indigo-50/60 hover:border-indigo-100">
                                    <span className="text-2xl mb-2">💬</span>
                                    <span className="text-sm font-semibold text-slate-800">Support</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;