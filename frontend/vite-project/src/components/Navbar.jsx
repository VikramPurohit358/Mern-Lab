import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';

function Navbar({ customer, wishlistCount: propWishlistCount }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { totalItems } = useCart();
    const [wishlistCount, setWishlistCount] = useState(propWishlistCount ?? 0);

    useEffect(() => {
        if (propWishlistCount !== undefined) {
            setWishlistCount(propWishlistCount);
            return;
        }

        // Fetch wishlist count when authenticated
        const fetchWishlistCount = async () => {
            try {
                const res = await api.get('/wishlist');
                if (res.data?.count !== undefined) {
                    setWishlistCount(res.data.count);
                }
            } catch (err) {
                // Ignore if not logged in
            }
        };

        fetchWishlistCount();
    }, [propWishlistCount, location.pathname]);

    const handleLogout = async () => {
        try {
            await api.post('/customers/logout');
            navigate('/login');
        } catch (error) {
            navigate('/login');
        }
    };

    const initials = customer?.fullName
        ? customer.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : 'SK';

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    <Link to="/home" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-lg font-black text-white shadow-md shadow-indigo-500/20">
                            SK
                        </div>
                        <div>
                            <span className="text-xl font-black tracking-tight text-slate-900">
                                Shop<span className="text-indigo-600">Kart</span>
                            </span>
                        </div>
                    </Link>

                    <nav className="hidden sm:flex items-center gap-1">
                        <Link
                            to="/home"
                            className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                                location.pathname === '/home'
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/products"
                            className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                                location.pathname === '/products' || location.pathname.startsWith('/products/')
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            Products
                        </Link>
                        <Link
                            to="/wishlist"
                            className={`relative inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                                location.pathname === '/wishlist'
                                    ? 'bg-rose-50 text-rose-600'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            <span>Wishlist</span>
                            {wishlistCount > 0 && (
                                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-bold text-white">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>
                        <Link
                            to="/cart"
                            className={`relative inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                                location.pathname === '/cart'
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            <span>Cart</span>
                            {totalItems > 0 && (
                                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-bold text-white">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                    {/* Mobile Quick Links */}
                    <div className="flex sm:hidden items-center gap-1">
                        <Link
                            to="/products"
                            className={`rounded-lg p-2 text-slate-700 hover:bg-slate-100 ${
                                location.pathname === '/products' ? 'bg-indigo-50 text-indigo-600' : ''
                            }`}
                            title="Browse Products"
                        >
                            🛍️
                        </Link>
                        <Link
                            to="/wishlist"
                            className={`relative rounded-lg p-2 text-slate-700 hover:bg-slate-100 ${
                                location.pathname === '/wishlist' ? 'bg-rose-50 text-rose-600' : ''
                            }`}
                            title="Wishlist"
                        >
                            ❤️
                            {wishlistCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>
                        <Link
                            to="/cart"
                            className={`relative rounded-lg p-2 text-slate-700 hover:bg-slate-100 ${
                                location.pathname === '/cart' ? 'bg-indigo-50 text-indigo-600' : ''
                            }`}
                            title="Cart"
                        >
                            🛒
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    </div>

                    {customer?.fullName && (
                        <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-2 pr-3.5 shadow-sm">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                                {initials}
                            </div>
                            <span className="text-sm font-semibold text-slate-800 hidden md:inline">
                                {customer.fullName}
                            </span>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-600 active:scale-95"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
