import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { loadRazorpayScript } from '../utils/loadRazorpay';

function Checkout() {
    const { cart, subtotal, totalItems, clearCart, loading: cartLoading } = useCart();
    const [customer, setCustomer] = useState(null);
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        addressLine1: '',
        city: '',
        state: '',
        pincode: ''
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [globalError, setGlobalError] = useState('');
    const navigate = useNavigate();

    // Check user authentication and pre-fill name/phone if available
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/customers/me');
                setCustomer(res.data);
                setForm((prev) => ({
                    ...prev,
                    fullName: prev.fullName || res.data?.fullName || '',
                    phone: prev.phone || res.data?.phone || ''
                }));
            } catch (err) {
                navigate('/login');
            }
        };
        fetchUser();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.fullName?.trim()) {
            newErrors.fullName = 'Full Name is required';
        }

        const cleanPhone = form.phone?.trim().replace(/\D/g, '');
        if (!form.phone?.trim()) {
            newErrors.phone = 'Phone Number is required';
        } else if (cleanPhone.length !== 10) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }

        if (!form.addressLine1?.trim()) {
            newErrors.addressLine1 = 'Address Line is required';
        }

        if (!form.city?.trim()) {
            newErrors.city = 'City is required';
        }

        if (!form.state?.trim()) {
            newErrors.state = 'State is required';
        }

        const cleanPincode = form.pincode?.trim();
        if (!cleanPincode) {
            newErrors.pincode = 'Pincode is required';
        } else if (!/^\d{6}$/.test(cleanPincode)) {
            newErrors.pincode = 'Pincode must contain exactly 6 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setGlobalError('');

        if (cart.length === 0) {
            setGlobalError('Your cart is empty. Please add products before checking out.');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setProcessing(true);

        try {
            // 1. Load Razorpay script
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                setGlobalError('Failed to load payment gateway SDK. Please check your internet connection.');
                setProcessing(false);
                return;
            }

            // 2. Create pending ShopKart order and Razorpay Order on server
            const createOrderRes = await api.post('/orders/create-payment-order', {
                shippingAddress: {
                    fullName: form.fullName.trim(),
                    phone: form.phone.trim(),
                    addressLine1: form.addressLine1.trim(),
                    city: form.city.trim(),
                    state: form.state.trim(),
                    pincode: form.pincode.trim()
                }
            });

            const { shopKartOrderId, razorpayOrderId, amount, currency, key } = createOrderRes.data;

            // 3. Open Razorpay Checkout standard modal
            const options = {
                key: key,
                amount: amount,
                currency: currency || 'INR',
                name: 'ShopKart',
                description: `Order #${shopKartOrderId}`,
                image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100&auto=format&fit=crop&q=80',
                order_id: razorpayOrderId,
                handler: async function (response) {
                    try {
                        setProcessing(true);
                        // 4. Verify payment on backend
                        const verifyRes = await api.post('/orders/verify-payment', {
                            shopKartOrderId: shopKartOrderId,
                            razorpay_order_id: response.razorpay_order_id || razorpayOrderId,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verifyRes.data?.success) {
                            // 5. Clear global cart state and navigate to Order Success
                            clearCart();
                            navigate(`/order-success/${shopKartOrderId}`);
                        } else {
                            setGlobalError('Payment verification failed on the server.');
                        }
                    } catch (verifyErr) {
                        setGlobalError(
                            verifyErr.response?.data?.message ||
                                'Payment verification error. Your cart is preserved.'
                        );
                    } finally {
                        setProcessing(false);
                    }
                },
                prefill: {
                    name: form.fullName.trim(),
                    contact: form.phone.trim(),
                    email: customer?.email || ''
                },
                theme: {
                    color: '#4f46e5'
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', function (response) {
                setProcessing(false);
                setGlobalError(
                    response.error?.description ||
                        'Payment was cancelled or failed. Your cart has not been cleared. Please try again.'
                );
            });

            rzp.open();
        } catch (err) {
            setGlobalError(
                err.response?.data?.message || 'Unable to initialize order. Please verify your details.'
            );
            setProcessing(false);
        }
    };

    const handleSimulatedPayment = async () => {
        setGlobalError('');

        if (cart.length === 0) {
            setGlobalError('Your cart is empty. Please add products before checking out.');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setProcessing(true);

        try {
            const createOrderRes = await api.post('/orders/create-payment-order', {
                shippingAddress: {
                    fullName: form.fullName.trim(),
                    phone: form.phone.trim(),
                    addressLine1: form.addressLine1.trim(),
                    city: form.city.trim(),
                    state: form.state.trim(),
                    pincode: form.pincode.trim()
                }
            });

            const { shopKartOrderId, razorpayOrderId } = createOrderRes.data;

            const verifyRes = await api.post('/orders/verify-payment', {
                shopKartOrderId,
                razorpay_order_id: razorpayOrderId,
                razorpay_payment_id: `pay_simulated_${Date.now()}`,
                razorpay_signature: 'test_signature_valid'
            });

            if (verifyRes.data?.success) {
                clearCart();
                navigate(`/order-success/${shopKartOrderId}`);
            } else {
                setGlobalError('Payment simulation failed.');
            }
        } catch (err) {
            setGlobalError(err.response?.data?.message || 'Unable to place order in simulation mode.');
        } finally {
            setProcessing(false);
        }
    };

    if (!cartLoading && cart.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
                <Navbar customer={customer} />
                <main className="mx-auto flex w-full max-w-lg flex-1 items-center justify-center px-4 py-16">
                    <div className="w-full rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-4xl">
                            🛒
                        </div>
                        <h2 className="mt-6 text-2xl font-bold text-slate-900">Your Cart is Empty</h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Please add products to your cart before proceeding to checkout.
                        </p>
                        <Link
                            to="/products"
                            className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-95"
                        >
                            Browse Catalog
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <Navbar customer={customer} />

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                        <Link to="/cart" className="hover:text-indigo-600">
                            Cart
                        </Link>
                        <span>›</span>
                        <span className="text-indigo-600">Checkout</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                        Checkout
                    </h1>
                </div>

                {globalError && (
                    <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">⚠️</span>
                            <div>
                                <p>{globalError}</p>
                                <p className="text-xs text-red-500 mt-0.5">
                                    Tip: If you do not have live Razorpay test keys in .env, you can use "Simulate Test Payment" to complete this order.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={handleSimulatedPayment}
                                disabled={processing}
                                className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer"
                            >
                                ⚡ Complete with Test Mode
                            </button>
                            <button
                                onClick={() => setGlobalError('')}
                                className="text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1 cursor-pointer"
                            >
                                ✕ Dismiss
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
                    {/* Left: Shipping Details Form */}
                    <div className="lg:col-span-7">
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
                            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                                    📍
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Shipping Address
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Where should we deliver your order?
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handlePlaceOrder} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Full Name */}
                                    <div>
                                        <label
                                            htmlFor="fullName"
                                            className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700"
                                        >
                                            Full Name *
                                        </label>
                                        <input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            placeholder="Aarav Sharma"
                                            value={form.fullName}
                                            onChange={handleChange}
                                            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-100 ${
                                                errors.fullName
                                                    ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                                                    : 'border-slate-300 bg-white focus:border-indigo-500'
                                            }`}
                                        />
                                        {errors.fullName && (
                                            <p className="mt-1 text-xs text-red-600 font-medium">
                                                {errors.fullName}
                                            </p>
                                        )}
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label
                                            htmlFor="phone"
                                            className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700"
                                        >
                                            Phone Number *
                                        </label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            placeholder="9876543210"
                                            value={form.phone}
                                            onChange={handleChange}
                                            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-100 ${
                                                errors.phone
                                                    ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                                                    : 'border-slate-300 bg-white focus:border-indigo-500'
                                            }`}
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 text-xs text-red-600 font-medium">
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Address Line 1 */}
                                <div>
                                    <label
                                        htmlFor="addressLine1"
                                        className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700"
                                    >
                                        Street Address / House No. *
                                    </label>
                                    <input
                                        id="addressLine1"
                                        name="addressLine1"
                                        type="text"
                                        placeholder="Flat 4B, Emerald Heights, MG Road"
                                        value={form.addressLine1}
                                        onChange={handleChange}
                                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-100 ${
                                            errors.addressLine1
                                                ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                                                : 'border-slate-300 bg-white focus:border-indigo-500'
                                        }`}
                                    />
                                    {errors.addressLine1 && (
                                        <p className="mt-1 text-xs text-red-600 font-medium">
                                            {errors.addressLine1}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* City */}
                                    <div>
                                        <label
                                            htmlFor="city"
                                            className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700"
                                        >
                                            City *
                                        </label>
                                        <input
                                            id="city"
                                            name="city"
                                            type="text"
                                            placeholder="Bengaluru"
                                            value={form.city}
                                            onChange={handleChange}
                                            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-100 ${
                                                errors.city
                                                    ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                                                    : 'border-slate-300 bg-white focus:border-indigo-500'
                                            }`}
                                        />
                                        {errors.city && (
                                            <p className="mt-1 text-xs text-red-600 font-medium">
                                                {errors.city}
                                            </p>
                                        )}
                                    </div>

                                    {/* State */}
                                    <div>
                                        <label
                                            htmlFor="state"
                                            className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700"
                                        >
                                            State *
                                        </label>
                                        <input
                                            id="state"
                                            name="state"
                                            type="text"
                                            placeholder="Karnataka"
                                            value={form.state}
                                            onChange={handleChange}
                                            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-100 ${
                                                errors.state
                                                    ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                                                    : 'border-slate-300 bg-white focus:border-indigo-500'
                                            }`}
                                        />
                                        {errors.state && (
                                            <p className="mt-1 text-xs text-red-600 font-medium">
                                                {errors.state}
                                            </p>
                                        )}
                                    </div>

                                    {/* Pincode */}
                                    <div>
                                        <label
                                            htmlFor="pincode"
                                            className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700"
                                        >
                                            Pincode (6 digits) *
                                        </label>
                                        <input
                                            id="pincode"
                                            name="pincode"
                                            type="text"
                                            maxLength={6}
                                            placeholder="560001"
                                            value={form.pincode}
                                            onChange={handleChange}
                                            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-100 ${
                                                errors.pincode
                                                    ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                                                    : 'border-slate-300 bg-white focus:border-indigo-500'
                                            }`}
                                        />
                                        {errors.pincode && (
                                            <p className="mt-1 text-xs text-red-600 font-medium">
                                                {errors.pincode}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right: Order Summary Review */}
                    <div className="lg:col-span-5 sticky top-24">
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                                Order Summary ({totalItems} items)
                            </h2>

                            {/* Items breakdown list */}
                            <div className="my-4 max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-100">
                                {cart.map((item) => (
                                    <div
                                        key={item.product?._id}
                                        className="flex items-center justify-between gap-3 pt-3 first:pt-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={item.product?.image}
                                                alt={item.product?.name}
                                                className="h-12 w-12 rounded-xl object-cover bg-slate-100 border border-slate-100"
                                                onError={(e) => {
                                                    e.target.src =
                                                        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';
                                                }}
                                            />
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                                                    {item.product?.name}
                                                </h4>
                                                <p className="text-[11px] text-slate-500">
                                                    Qty: {item.quantity} × ₹{item.product?.price?.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <span className="text-xs font-black text-slate-900">
                                            ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Express Shipping</span>
                                    <span className="font-semibold text-emerald-600">FREE</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                    <span className="text-base font-bold text-slate-900">Grand Total</span>
                                    <span className="text-2xl font-black text-slate-900">
                                        ₹{subtotal.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Place Order CTA */}
                            <button
                                onClick={handlePlaceOrder}
                                disabled={processing || cart.length === 0}
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                            >
                                {processing ? (
                                    <>
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        <span>Opening Razorpay Checkout...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Pay ₹{subtotal.toLocaleString()} with Razorpay 💳</span>
                                    </>
                                )}
                            </button>

                            {/* Simulate Test Payment Button */}
                            <button
                                type="button"
                                onClick={handleSimulatedPayment}
                                disabled={processing || cart.length === 0}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/70 py-3.5 text-sm font-bold text-indigo-700 transition-all hover:bg-indigo-100 hover:border-indigo-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                            >
                                {processing ? (
                                    <span>Processing...</span>
                                ) : (
                                    <span>⚡ Simulate Test Payment (Demo / Bypass Gateway)</span>
                                )}
                            </button>

                            <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                                <div className="flex items-center gap-2">
                                    <span>🔒</span>
                                    <span>Razorpay Test Mode standard checkout</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>🛡️</span>
                                    <span>Server-verified 256-bit HMAC signature</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Checkout;
