import React, { createContext, useState, useContext, useEffect } from 'react';
import { addToCart, removeFromCart, getCart } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchCart(user.id);
        } else {
            setCart([]);
            setCartCount(0);
        }
    }, [user]);

    useEffect(() => {
        setCartCount(cart.length);
    }, [cart]);

    const fetchCart = async (userId) => {
        try {
            const cartData = await getCart(userId);
            setCart(cartData);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    const handleAddToCart = async (productId, quantity) => {
        if (!user) {
            console.error('User not logged in');
            return;
        }
        try {
            const updatedCart = await addToCart(user.id, productId, quantity);
            setCart(updatedCart);
        } catch (error) {
            console.error('Error updating cart:', error);
            throw error;
        }
    };

    const handleRemoveFromCart = async (productId) => {
        if (!user) {
            console.error('User not logged in');
            return;
        }
        try {
            const updatedCart = await removeFromCart(user.id, productId);
            setCart(updatedCart);
        } catch (error) {
            console.error('Error updating cart:', error);
            throw error;
        }
    };

    const clearCart = () => {
        setCart([]);
        setCartCount(0);
    };

    return (
        <CartContext.Provider value={{ 
            cart, 
            cartCount,
            handleAddToCart, 
            handleRemoveFromCart, 
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);