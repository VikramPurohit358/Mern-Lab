import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import api from '../services/api';

function Products() {
    const [products, setProducts] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [sort, setSort] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/customers/me');
                setCustomer(res.data);
            } catch (err) {
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');
            try {
                const params = {};
                if (search.trim()) params.search = search.trim();
                if (category) params.category = category;
                if (sort) params.sort = sort;

                const response = await api.get('/products', { params });
                setProducts(response.data.products || []);
            } catch (err) {
                setError('Something went wrong while loading products.');
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchProducts();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, category, sort]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar customer={customer} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-2">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                        Explore Products
                    </h1>
                    <p className="text-slate-500">
                        Discover top deals and high quality products tailored for you.
                    </p>
                </div>

                <div className="mb-8">
                    <SearchBar
                        search={search}
                        setSearch={setSearch}
                        category={category}
                        setCategory={setCategory}
                        sort={sort}
                        setSort={setSort}
                    />
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                        <p className="mt-4 text-sm font-semibold text-slate-600">Loading products...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                        <span className="text-4xl">⚠️</span>
                        <p className="mt-3 text-base font-semibold text-red-700">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && products.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
                        <span className="text-4xl">🔍</span>
                        <h3 className="mt-4 text-lg font-bold text-slate-900">No products found.</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Try adjusting your search or category filter to find what you are looking for.
                        </p>
                        <button
                            onClick={() => {
                                setSearch('');
                                setCategory('');
                                setSort('');
                            }}
                            className="mt-5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {!loading && !error && products.length > 0 && (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Products;
