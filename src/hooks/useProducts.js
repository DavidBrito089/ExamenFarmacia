import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;
            setProducts(data || []);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getDailyDeals = () => {
        return products.filter(p => p.is_daily_deal || p.discount_percent > 0);
    };

    const getCategories = () => {
        return [...new Set(products.map(p => p.category))];
    };

    return {
        products,
        loading,
        error,
        refetch: fetchProducts,
        getDailyDeals,
        getCategories
    };
}
