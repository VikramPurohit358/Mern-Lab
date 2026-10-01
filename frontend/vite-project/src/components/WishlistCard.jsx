import { useState } from 'react';
import { Link } from 'react-router-dom';

function WishlistCard({ product, onRemove }) {
    const [removing, setRemoving] = useState(false);
    const [removeError, setRemoveError] = useState('');

    const isOutOfStock = product.stock <= 0;

    const handleRemove = async () => {
        setRemoving(true);
        setRemoveError('');
        try {
            await onRemove(product._id);
        } catch (err) {
            setRemoveError(err.response?.data?.message || 'Failed to remove product');
            setRemoving(false);
        }
    };

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/10">
            <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';
                    }}
                />

                <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-md">
                    {product.category}
                </span>

                <button
                    onClick={handleRemove}
                    disabled={removing}
                    title="Remove from Wishlist"
                    className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-rose-600 shadow-md backdrop-blur-md transition-all hover:scale-110 hover:bg-rose-50 active:scale-95 disabled:opacity-60"
                >
                    {removing ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
                    ) : (
                        <svg className="h-5 w-5 fill-rose-600 text-rose-600" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
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

            <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-rose-600 transition-colors">
                    {product.name}
                </h3>
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
                        <span className={`text-xs font-semibold ${isOutOfStock ? 'text-red-500' : 'text-emerald-600'}`}>
                            {isOutOfStock ? '0 units left' : `${product.stock} units left`}
                        </span>
                    </div>
                </div>

                {removeError && (
                    <p className="mt-2 text-xs text-red-600 bg-red-50 p-1.5 rounded-lg border border-red-200">
                        {removeError}
                    </p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                        to={`/products/${product._id}`}
                        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-slate-800 active:scale-[0.98]"
                    >
                        View Details
                    </Link>
                    <button
                        onClick={handleRemove}
                        disabled={removing}
                        className="inline-flex items-center justify-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700 transition-all duration-200 hover:bg-rose-100 hover:text-rose-800 active:scale-[0.98] disabled:opacity-50"
                    >
                        {removing ? (
                            <>
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
                                <span>Removing...</span>
                            </>
                        ) : (
                            <>
                                <span>Remove</span>
                                <span>♥</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default WishlistCard;
