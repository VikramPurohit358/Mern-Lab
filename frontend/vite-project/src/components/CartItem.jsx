import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function CartItem({ item }) {
    const { updateQuantity, removeFromCart, itemLoading } = useCart();
    const [actionError, setActionError] = useState('');

    const product = item.product;
    const quantity = item.quantity;
    const isUpdating = itemLoading[product?._id] === 'updating';
    const isRemoving = itemLoading[product?._id] === 'removing';
    const isMaxStock = quantity >= (product?.stock || 0);

    if (!product) return null;

    const handleIncrease = async () => {
        if (isMaxStock || isUpdating || isRemoving) return;
        setActionError('');
        try {
            await updateQuantity(product._id, quantity + 1);
        } catch (err) {
            setActionError(err.message);
            setTimeout(() => setActionError(''), 3000);
        }
    };

    const handleDecrease = async () => {
        if (quantity <= 1 || isUpdating || isRemoving) return;
        setActionError('');
        try {
            await updateQuantity(product._id, quantity - 1);
        } catch (err) {
            setActionError(err.message);
            setTimeout(() => setActionError(''), 3000);
        }
    };

    const handleRemove = async () => {
        if (isRemoving) return;
        setActionError('');
        try {
            await removeFromCart(product._id);
        } catch (err) {
            setActionError(err.message);
            setTimeout(() => setActionError(''), 3000);
        }
    };

    const itemTotal = (product.price || 0) * quantity;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm transition-all hover:border-slate-300">
            {/* Left: Image & Info */}
            <div className="flex items-center gap-4">
                <Link
                    to={`/products/${product._id}`}
                    className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-24"
                >
                    <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover object-center transition-transform hover:scale-105"
                        onError={(e) => {
                            e.target.src =
                                'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';
                        }}
                    />
                </Link>

                <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                        {product.category}
                    </span>
                    <Link
                        to={`/products/${product._id}`}
                        className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1 sm:line-clamp-2"
                    >
                        {product.name}
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-700">
                            ₹{product.price?.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400">each</span>
                    </div>

                    {actionError && (
                        <span className="mt-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-md self-start border border-red-200">
                            {actionError}
                        </span>
                    )}
                </div>
            </div>

            {/* Right: Quantity Controls & Subtotal */}
            <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0">
                {/* Quantity Buttons */}
                <div className="flex flex-col items-center">
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-inner">
                        <button
                            onClick={handleDecrease}
                            disabled={quantity <= 1 || isUpdating || isRemoving}
                            title={quantity <= 1 ? 'Minimum quantity is 1' : 'Decrease quantity'}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            −
                        </button>
                        <span className="flex h-8 min-w-[36px] items-center justify-center px-2 text-sm font-black text-slate-900">
                            {isUpdating ? (
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                            ) : (
                                quantity
                            )}
                        </span>
                        <button
                            onClick={handleIncrease}
                            disabled={isMaxStock || isUpdating || isRemoving}
                            title={isMaxStock ? 'Maximum available stock reached' : 'Increase quantity'}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            +
                        </button>
                    </div>

                    {isMaxStock && (
                        <span className="mt-1 text-[10px] font-semibold text-amber-600">
                            Max stock ({product.stock})
                        </span>
                    )}
                </div>

                {/* Line Total Price */}
                <div className="text-right min-w-[90px]">
                    <span className="block text-xs text-slate-400">Total</span>
                    <span className="text-base font-black text-slate-900">
                        ₹{itemTotal.toLocaleString()}
                    </span>
                </div>

                {/* Remove Action */}
                <button
                    onClick={handleRemove}
                    disabled={isRemoving}
                    title="Remove item"
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 active:scale-90 disabled:opacity-50"
                >
                    {isRemoving ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
                    ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}

export default CartItem;
