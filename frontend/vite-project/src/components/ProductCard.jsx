import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

function ProductCard({ product }) {
    const { addToCart, getItemQuantity, itemLoading: cartItemLoading } = useCart();
    const { isWishlisted, toggleWishlist, itemLoading: wishlistItemLoading } = useWishlist();
    const [cartError, setCartError] = useState('');
    const [cartSuccess, setCartSuccess] = useState('');

    const isOutOfStock = product.stock <= 0;
    const isAddingToCart = cartItemLoading[product._id] === 'adding';
    const isWishlistUpdating = wishlistItemLoading[product._id];
    const quantityInCart = getItemQuantity(product._id);
    const isMaxStockReached = quantityInCart >= product.stock;
    const wishlisted = isWishlisted(product._id);

    const handleWishlistClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isWishlistUpdating) return;

        try {
            await toggleWishlist(product._id);
        } catch (err) {
            setCartError(err.response?.data?.message || 'Please log in to save products.');
            setTimeout(() => setCartError(''), 3000);
        }
    };

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOutOfStock || isAddingToCart || isMaxStockReached) return;

        setCartError('');
        setCartSuccess('');
        try {
            await addToCart(product._id);
            setCartSuccess('Added to cart!');
            setTimeout(() => setCartSuccess(''), 2000);
        } catch (err) {
            setCartError(err.message);
            setTimeout(() => setCartError(''), 3500);
        }
    };

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10">
            {/* Image Container */}
            <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        e.target.src =
                            'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';
                    }}
                />

                <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-md">
                    {product.category}
                </span>

                {/* Quick Wishlist Action */}
                <button
                    onClick={handleWishlistClick}
                    disabled={isWishlistUpdating}
                    title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full shadow-md backdrop-blur-md transition-all active:scale-90 disabled:opacity-60 ${
                        wishlisted
                            ? 'bg-rose-500 text-white hover:bg-rose-600'
                            : 'bg-white/90 text-slate-600 hover:bg-white hover:text-rose-500'
                    }`}
                >
                    {isWishlistUpdating ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
                    ) : (
                        <svg
                            className={`h-5 w-5 transition-transform ${
                                wishlisted ? 'fill-current scale-110' : 'fill-none stroke-current stroke-2'
                            }`}
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                            />
                        </svg>
                    )}
                </button>

                {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
                        <span className="rounded-full bg-red-600 px-3.5 py-1 text-xs font-bold text-white uppercase tracking-wider">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* Product Body */}
            <div className="flex flex-1 flex-col p-5">
                <Link
                    to={`/products/${product._id}`}
                    className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors"
                >
                    {product.name}
                </Link>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2 flex-1">
                    {product.description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                    <div>
                        <span className="text-xs text-slate-400 block">Price</span>
                        <span className="text-lg font-black text-slate-900">
                            ₹{product.price?.toLocaleString()}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-slate-400 block">Stock</span>
                        <span
                            className={`text-xs font-semibold ${
                                isOutOfStock ? 'text-red-500' : 'text-emerald-600'
                            }`}
                        >
                            {isOutOfStock ? '0 units left' : `${product.stock} units left`}
                        </span>
                    </div>
                </div>

                {/* Status / Error feedback */}
                {cartError && (
                    <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-1.5 text-center text-xs font-medium text-red-600">
                        {cartError}
                    </div>
                )}

                {cartSuccess && (
                    <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 p-1.5 text-center text-xs font-semibold text-emerald-700">
                        ✓ {cartSuccess}
                    </div>
                )}

                {/* Actions: View Details & Add to Cart */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                        to={`/products/${product._id}`}
                        className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-200 active:scale-[0.98]"
                    >
                        View Details
                    </Link>

                    <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock || isAddingToCart || isMaxStockReached}
                        className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
                            isOutOfStock
                                ? 'bg-slate-300 text-slate-500'
                                : quantityInCart > 0
                                ? 'bg-indigo-700 hover:bg-indigo-800'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                    >
                        {isAddingToCart ? (
                            <>
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>Adding...</span>
                            </>
                        ) : isOutOfStock ? (
                            'Out of Stock'
                        ) : isMaxStockReached ? (
                            'Max in Cart'
                        ) : quantityInCart > 0 ? (
                            `In Cart (${quantityInCart}) +`
                        ) : (
                            'Add to Cart 🛒'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
