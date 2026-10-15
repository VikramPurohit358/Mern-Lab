import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [itemLoading, setItemLoading] = useState({});

    const fetchWishlist = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/wishlist');
            setWishlist(res.data?.wishlist || []);
        } catch (err) {
            if (err.response?.status !== 401) {
                setError(err.response?.data?.message || "We couldn't load your wishlist.");
            }
            setWishlist([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const addToWishlist = async (productId) => {
        setItemLoading((prev) => ({ ...prev, [productId]: true }));
        try {
            await api.post(`/wishlist/${productId}`);
            await fetchWishlist();
        } catch (err) {
            throw err;
        } finally {
            setItemLoading((prev) => {
                const next = { ...prev };
                delete next[productId];
                return next;
            });
        }
    };

    const removeFromWishlist = async (productId) => {
        setItemLoading((prev) => ({ ...prev, [productId]: true }));
        try {
            await api.delete(`/wishlist/${productId}`);
            setWishlist((prev) => prev.filter((item) => item._id !== productId));
        } catch (err) {
            throw err;
        } finally {
            setItemLoading((prev) => {
                const next = { ...prev };
                delete next[productId];
                return next;
            });
        }
    };

    const toggleWishlist = async (productId) => {
        setItemLoading((prev) => ({ ...prev, [productId]: true }));
        try {
            const res = await api.patch(`/wishlist/${productId}/toggle`);
            if (res.data?.saved) {
                await fetchWishlist();
            } else {
                setWishlist((prev) => prev.filter((item) => item._id !== productId));
            }
            return res.data;
        } catch (err) {
            throw err;
        } finally {
            setItemLoading((prev) => {
                const next = { ...prev };
                delete next[productId];
                return next;
            });
        }
    };

    const isWishlisted = (productId) => {
        return wishlist.some((item) => item._id === productId);
    };

    const clearWishlist = () => {
        setWishlist([]);
        setError('');
    };

    const wishlistCount = wishlist.length;

    const value = {
        wishlist,
        wishlistCount,
        loading,
        error,
        itemLoading,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isWishlisted,
        clearWishlist
    };

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
