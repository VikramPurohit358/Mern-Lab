import { Link } from 'react-router-dom';

function ProductCard({ product }) {
    const isOutOfStock = product.stock <= 0;

    return (
        <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10">
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
                {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
                        <span className="rounded-full bg-red-600 px-3.5 py-1 text-xs font-bold text-white uppercase tracking-wider">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
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

                <Link
                    to={`/products/${product._id}`}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-600 active:scale-[0.98]"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
}

export default ProductCard;
