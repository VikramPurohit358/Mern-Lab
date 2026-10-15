import { Link } from 'react-router-dom';

function OrderCard({ order }) {
    const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'DELIVERED':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'SHIPPED':
                return 'bg-sky-50 text-sky-700 border-sky-200';
            case 'CONFIRMED':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'PLACED':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'CANCELLED':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const steps = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
    const currentStepIndex = steps.indexOf(order.status);

    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md">
            {/* Header: Order ID & Date */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                    <span className="text-xs font-semibold text-slate-400">Order ID</span>
                    <h3 className="text-sm font-mono font-bold text-slate-900">#{order._id}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{formattedDate}</p>
                </div>

                <div className="flex items-center gap-2">
                    <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${getStatusColor(
                            order.status
                        )}`}
                    >
                        ● {order.status}
                    </span>

                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            order.paymentStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                        }`}
                    >
                        {order.paymentStatus === 'PAID' ? '✓ Paid' : 'Pending Payment'}
                    </span>
                </div>
            </div>

            {/* Status Progression Bar (Bonus) */}
            {order.status !== 'CANCELLED' && order.status !== 'PENDING_PAYMENT' && (
                <div className="my-4 hidden sm:block">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
                        {steps.map((step, idx) => (
                            <span
                                key={step}
                                className={
                                    idx <= currentStepIndex
                                        ? 'text-indigo-600 font-bold'
                                        : 'text-slate-400'
                                }
                            >
                                {step}
                            </span>
                        ))}
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500 rounded-full"
                            style={{
                                width: `${((currentStepIndex + 1) / steps.length) * 100}%`
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Items List */}
            <div className="py-4 divide-y divide-slate-100">
                {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="h-12 w-12 rounded-xl object-cover bg-slate-100 border border-slate-100"
                                onError={(e) => {
                                    e.target.src =
                                        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';
                                }}
                            />
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 line-clamp-1">
                                    {item.name}
                                </h4>
                                <span className="text-xs text-slate-500">
                                    Qty: {item.quantity} × ₹{item.price?.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <span className="text-sm font-bold text-slate-900">
                            ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>

            {/* Footer: Address Summary & Total & Action */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-100 pt-4">
                <div className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Delivery to:</span>{' '}
                    {order.shippingAddress?.fullName}, {order.shippingAddress?.city},{' '}
                    {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                        <span className="block text-xs text-slate-400">Total Paid</span>
                        <span className="text-lg font-black text-slate-900">
                            ₹{order.totalAmount?.toLocaleString()}
                        </span>
                    </div>

                    <Link
                        to={`/orders/${order._id}`}
                        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-600 active:scale-95"
                    >
                        View Details →
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default OrderCard;
