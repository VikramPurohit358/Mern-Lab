import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import api from '../services/api';

function ProductDetails() {
    const { id } = useParams();
    const { addToCart, getItemQuantity, itemLoading } = useCart();
    const [product, setProduct] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [wishlistMessage, setWishlistMessage] = useState('');
    const [wishlistError, setWishlistError] = useState('');
    const [cartError, setCartError] = useState('');
    const [cartSuccess, setCartSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await api.get('/customers/me');
                setCustomer(res.data);

                const wishlistRes = await api.get('/wishlist');
                if (wishlistRes.data?.wishlist) {
                    const found = wishlistRes.data.wishlist.some((item) => item._id === id);
                    setIsWishlisted(found);
                }
            } catch (err) {
            }
        };
        fetchUserData();
    }, [id]);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await api.get(`/products/${id}`);
                setProduct(response.data.product || response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Something went wrong while loading product.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const isAddingToCart = itemLoading[id] === 'adding';
    const quantityInCart = product ? getItemQuantity(product._id) : 0;
    const isOutOfStock = product ? product.stock <= 0 : true;
    const isMaxStockReached = product ? quantityInCart >= product.stock : false;

    const handleAddToCart = async () => {
        if (isOutOfStock || isAddingToCart || isMaxStockReached) return;
        setCartError('');
        setCartSuccess('');
        try {
            await addToCart(product._id);
            setCartSuccess('Product added to your cart!');
            setTimeout(() => setCartSuccess(''), 2500);
        } catch (err) {
            setCartError(err.message);
            setTimeout(() => setCartError(''), 3500);
        }
    };

    const handleWishlistToggle = async () => {
        if (wishlistLoading) return;
        setWishlistLoading(true);
        setWishlistMessage('Saving...');
        setWishlistError('');

        try {
            if (isWishlisted) {
                await api.delete(`/wishlist/${id}`);
                setIsWishlisted(false);
                setWishlistMessage('');
            } else {
                await api.post(`/wishlist/${id}`);
                setIsWishlisted(true);
                setWishlistMessage('Added to Wishlist');
                setTimeout(() => setWishlistMessage(''), 3000);
            }
        } catch (err) {
            if (err.response?.status === 409) {
                setIsWishlisted(true);
                setWishlistMessage('Already in Wishlist');
                setTimeout(() => setWishlistMessage(''), 2500);
            } else if (err.response?.status === 401) {
                setWishlistError('Please log in to save products.');
                setTimeout(() => setWishlistError(''), 3500);
            } else {
                setWishlistError(err.response?.data?.message || 'Unable to save product. Please try again.');
                setTimeout(() => setWishlistError(''), 3500);
            }
        } finally {
            setWishlistLoading(false);
        }
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
                        <p className="mt-4 text-sm font-semibold text-slate-600">Loading product...</p>
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
                                    e.target.src =
                                        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';
                                }}
                            />
                            <span className="absolute top-6 left-6 rounded-full bg-white/90 px-3.5 py-1 text-xs font-bold text-slate-800 shadow-sm backdrop-blur-md">
                                {product.category}
                            </span>
                        </div>

                        <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                                        {product.category}
                                    </span>

                                    <button
                                        onClick={handleWishlistToggle}
                                        disabled={wishlistLoading}
                                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-50 ${
                                            isWishlisted
                                                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                                : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
                                        }`}
                                    >
                                        <svg
                                            className={`h-4 w-4 ${
                                                isWishlisted
                                                    ? 'fill-rose-600 text-rose-600'
                                                    : 'fill-none stroke-current stroke-2'
                                            }`}
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                        </svg>
                                        <span>{isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
                                    </button>
                                </div>

                                <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
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
                                        {product.stock > 0
                                            ? `In Stock (${product.stock} available)`
                                            : 'Out of Stock'}
                                    </span>
                                </div>

                                {wishlistError && (
                                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-600">
                                        {wishlistError}
                                    </div>
                                )}

                                {wishlistMessage && (
                                    <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-semibold text-rose-700">
                                        ♥ {wishlistMessage}
                                    </div>
                                )}

                                {cartError && (
                                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-600">
                                        {cartError}
                                    </div>
                                )}

                                {cartSuccess && (
                                    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-700">
                                        ✓ {cartSuccess}
                                    </div>
                                )}

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
                                    disabled={isOutOfStock || isAddingToCart || isMaxStockReached}
                                    className={`w-full rounded-2xl py-4 text-base font-bold text-white shadow-md transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${
                                        isOutOfStock
                                            ? 'bg-slate-300 text-slate-500'
                                            : cartSuccess
                                            ? 'bg-emerald-600 shadow-emerald-500/25'
                                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
                                    }`}
                                >
                                    {isAddingToCart ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            <span>Adding to Cart...</span>
                                        </span>
                                    ) : isOutOfStock ? (
                                        'Out of Stock'
                                    ) : isMaxStockReached ? (
                                        `Max Quantity in Cart (${quantityInCart})`
                                    ) : quantityInCart > 0 ? (
                                        `In Cart (${quantityInCart}) • Add Another 🛒`
                                    ) : (
                                        'Add to Cart 🛒'
                                    )}
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
