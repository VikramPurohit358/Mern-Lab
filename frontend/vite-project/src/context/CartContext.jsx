import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [itemLoading, setItemLoading] = useState({});

    const fetchCart = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/cart');
            setCart(res.data?.cart || []);
        } catch (err) {
            if (err.response?.status !== 401) {
                setError(err.response?.data?.message || 'Unable to load your cart.');
            }
            setCart([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = async (productId) => {
        setItemLoading((prev) => ({ ...prev, [productId]: 'adding' }));
        setError('');
        try {
            const res = await api.post(`/cart/${productId}`);
            setCart(res.data?.cart || []);
            return { success: true, cart: res.data?.cart };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to add product to cart';
            throw new Error(msg);
        } finally {
            setItemLoading((prev) => {
                const next = { ...prev };
                delete next[productId];
                return next;
            });
        }
    };

    const updateQuantity = async (productId, quantity) => {
        setItemLoading((prev) => ({ ...prev, [productId]: 'updating' }));
        setError('');
        try {
            const res = await api.patch(`/cart/${productId}`, { quantity });
            setCart(res.data?.cart || []);
            return { success: true, cart: res.data?.cart };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update quantity';
            throw new Error(msg);
        } finally {
            setItemLoading((prev) => {
                const next = { ...prev };
                delete next[productId];
                return next;
            });
        }
    };

    const removeFromCart = async (productId) => {
        setItemLoading((prev) => ({ ...prev, [productId]: 'removing' }));
        setError('');
        try {
            const res = await api.delete(`/cart/${productId}`);
            setCart(res.data?.cart || []);
            return { success: true, cart: res.data?.cart };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to remove product from cart';
            throw new Error(msg);
        } finally {
            setItemLoading((prev) => {
                const next = { ...prev };
                delete next[productId];
                return next;
            });
        }
    };

    const getItemQuantity = (productId) => {
        const item = cart.find((i) => i.product?._id === productId);
        return item ? item.quantity : 0;
    };

    const isInCart = (productId) => {
        return cart.some((i) => i.product?._id === productId);
    };

    // Derived values
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const subtotal = cart.reduce(
        (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
        0
    );
    const itemCount = cart.length;

    const value = {
        cart,
        loading,
        error,
        itemLoading,
        totalItems,
        subtotal,
        itemCount,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        getItemQuantity,
        isInCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
