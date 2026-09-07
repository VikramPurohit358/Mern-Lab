import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [added, setAdded] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/customers/me');
                setCustomer(res.data);
            } catch (err) {
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await api.get(`/products/${id}`);
                setProduct(response.data.product || response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Something went wrong while loading products.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const handleAddToCart = () => {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar customer={customer} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Products
                    </Link>
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                        <p className="mt-4 text-sm font-semibold text-slate-600">Loading products...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
                        <span className="text-4xl">⚠️</span>
                        <h3 className="mt-3 text-lg font-bold text-red-800">{error}</h3>
                        <Link
                            to="/products"
                            className="mt-4 inline-block rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            Return to Catalog
                        </Link>
                    </div>
                )}

                {!loading && !error && product && (
                    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm lg:grid lg:grid-cols-2 lg:gap-8">
                        <div className="relative aspect-square w-full overflow-hidden bg-slate-100 p-6 sm:p-10 flex items-center justify-center">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="max-h-full max-w-full rounded-2xl object-cover shadow-md"
                                onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';
                                }}
                            />
                            <span className="absolute top-6 left-6 rounded-full bg-white/90 px-3.5 py-1 text-xs font-bold text-slate-800 shadow-sm backdrop-blur-md">
                                {product.category}
                            </span>
                        </div>

                        <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12">
                            <div>
                                <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 mb-3">
                                    {product.category}
                                </span>
                                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                                    {product.name}
                                </h1>

                                <div className="mt-4 flex items-center gap-4">
                                    <span className="text-3xl font-black text-slate-900">
                                        ₹{product.price?.toLocaleString()}
                                    </span>
                                    <span
                                        className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold ${
                                            product.stock > 0
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : 'bg-red-50 text-red-700 border border-red-200'
                                        }`}
                                    >
                                        {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
                                    </span>
                                </div>

                                <div className="mt-6 border-t border-slate-100 pt-6">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                                        Description
                                    </h3>
                                    <p className="mt-2 text-base leading-relaxed text-slate-600">
                                        {product.description}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 border-t border-slate-100 pt-6 space-y-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock <= 0}
                                    className={`w-full rounded-2xl py-4 text-base font-bold text-white shadow-md transition-all active:scale-[0.99] ${
                                        product.stock <= 0
                                            ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                                            : added
                                            ? 'bg-emerald-600 shadow-emerald-500/25'
                                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
                                    }`}
                                >
                                    {added ? '✓ Added to Cart' : product.stock <= 0 ? 'Out of Stock' : 'Add to Cart 🛒'}
                                </button>

                                <div className="grid grid-cols-2 gap-3 pt-2 text-center text-xs text-slate-500">
                                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                                        🚚 Free Express Delivery
                                    </div>
                                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                                        🛡️ 1-Year Warranty Included
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

export default ProductDetails;
