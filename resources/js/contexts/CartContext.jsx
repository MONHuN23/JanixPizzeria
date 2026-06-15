import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (pizza, quantity = 1) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === pizza.id);
            if (existing) {
                return prev.map(item => 
                    item.id === pizza.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prev, { ...pizza, quantity }];
        });
    };

    const updateQuantity = (pizzaId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(pizzaId);
            return;
        }
        setCart(prev => prev.map(item => 
            item.id === pizzaId ? { ...item, quantity } : item
        ));
    };

    const removeFromCart = (pizzaId) => {
        setCart(prev => prev.filter(item => item.id !== pizzaId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount }}>
            {children}
        </CartContext.Provider>
    );
};
