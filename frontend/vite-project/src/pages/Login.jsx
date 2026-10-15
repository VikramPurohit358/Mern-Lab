import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';

function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { fetchCart } = useCart();
    const { fetchWishlist } = useWishlist();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await api.get('/customers/me');
                await Promise.all([fetchCart(), fetchWishlist()]);
                navigate('/home', { replace: true });
            } catch (err) {
            }
        };
        checkAuth();
    }, [navigate, fetchCart, fetchWishlist]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.email || !form.password) {
            setError('All fields are required');
            return;
        }

        setLoading(true);
        try {
            await api.post('/customers/login', form);
            await Promise.all([fetchCart(), fetchWishlist()]);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid Credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-black text-white shadow-sm">
                        S
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">ShopKart</h1>
                    <p className="mt-2 text-sm text-slate-500">Welcome back to your favorite store</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">Log In</h2>
                        <p className="mt-1 text-sm text-slate-500">Enter your credentials to continue.</p>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50"
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;