import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [discountRules, setDiscountRules] = useState([]);

    useEffect(() => {
        fetchProducts();
        fetchDiscountRules();
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

    const fetchDiscountRules = async () => {
        const { data } = await supabase
            .from('discount_rules')
            .select('*')
            .eq('is_active', true);

        setDiscountRules(data || []);
    };

    // Apply automatic discounts based on current day and category (ONLY from rules)
    const getProductsWithAutoDiscount = () => {
        const today = new Date().getDay(); // 0=Sun, 1=Mon, etc.

        return products.map(product => {
            // Find matching rule for this product's category and today
            const matchingRule = discountRules.find(
                rule => rule.category === product.category &&
                    rule.days_of_week.includes(today)
            );

            if (matchingRule) {
                // Apply ONLY the rule's discount (ignore product's own discount_percent)
                return {
                    ...product,
                    original_price: product.price,
                    discount_percent: matchingRule.discount_percent,
                    promotion_type: matchingRule.promotion_type || 'percentage',
                    auto_discount_applied: true,
                    auto_discount_name: matchingRule.name
                };
            }

            // No rule matches - set discount to 0 (ignore product's own discount)
            return {
                ...product,
                original_price: product.price,
                discount_percent: 0,
                promotion_type: null
            };
        });
    };

    const getDailyDeals = () => {
        // Return products that have discounts TODAY based on active rules
        const productsWithDiscounts = getProductsWithAutoDiscount();
        return productsWithDiscounts.filter(p => p.discount_percent > 0 || p.is_liquidation);
    };

    const getCategories = () => {
        return [...new Set(products.map(p => p.category))];
    };

    const getLiquidationProducts = () => {
        return products.filter(p => p.is_liquidation === true);
    };

    const getExpiringProducts = (days = 90) => {
        const today = new Date();
        return products.filter(p => {
            if (!p.expiration_date) return false;
            const expDate = new Date(p.expiration_date);
            const daysUntil = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
            return daysUntil > 0 && daysUntil <= days;
        });
    };

    return {
        products: getProductsWithAutoDiscount(),
        rawProducts: products,
        loading,
        error,
        refetch: fetchProducts,
        getDailyDeals,
        getCategories,
        getLiquidationProducts,
        getExpiringProducts,
        discountRules
    };
}
