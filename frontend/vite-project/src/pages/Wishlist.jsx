import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WishlistCard from '../components/WishlistCard';
import api from '../services/api';

function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Check auth and fetch customer profile
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

    // Fetch user wishlist
    const fetchWishlist = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/wishlist');
            setWishlist(response.data?.wishlist || []);
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/login');
            } else {
                setError(err.response?.data?.message || "We couldn't load your wishlist.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    // Remove item handler passed to WishlistCard
    const handleRemoveProduct = async (productId) => {
        await api.delete(`/wishlist/${productId}`);
        setWishlist((prev) => prev.filter((item) => item._id !== productId));
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <Navbar customer={customer} wishlistCount={wishlist.length} />

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                            My Wishlist
                        </h1>
                        {!loading && !error && (
                            <p className="mt-1 text-sm text-slate-500">
                                {wishlist.length} {wishlist.length === 1 ? 'product saved' : 'products saved'}
                            </p>
                        )}
                    </div>

                    {!loading && !error && wishlist.length > 0 && (
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
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-rose-500 border-t-transparent shadow-sm"></div>
                        <p className="mt-4 text-base font-semibold text-slate-600">
                            Loading your wishlist...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="mx-auto max-w-md rounded-3xl border border-red-200 bg-red-50/70 p-8 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl">
                            ⚠️
                        </div>
                        <h3 className="mt-4 text-xl font-bold text-red-900">Something went wrong.</h3>
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                        <button
                            onClick={fetchWishlist}
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-95"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && wishlist.length === 0 && (
                    <div className="mx-auto max-w-md rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-4xl shadow-inner">
                            ❤️
                        </div>
                        <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
                            Your wishlist is empty
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                            Save products you love and find them here later.
                        </p>
                        <Link
                            to="/products"
                            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-95"
                        >
                            <span>Browse Products</span>
                        </Link>
                    </div>
                )}

                {/* Wishlist Grid */}
                {!loading && !error && wishlist.length > 0 && (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {wishlist.map((product) => (
                            <WishlistCard
                                key={product._id}
                                product={product}
                                onRemove={handleRemoveProduct}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Wishlist;
