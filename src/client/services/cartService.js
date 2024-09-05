export const getCart = async (userId) => {
    try {
        const response = await fetch(`/api/cart/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch cart');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching cart:', error);
        throw error;
    }
};

export const addToCart = async (userId, productId, quantity) => {
    try {
        const response = await fetch(`/api/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, productId, quantity }),
        });

        if (!response.ok) {
            throw new Error('Failed to add item to cart');
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding item to cart:', error);
        throw error;
    }
};

export const removeFromCart = async (userId, productId) => {
    try {
        const response = await fetch(`/api/cart/remove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, productId }),
        });

        if (!response.ok) {
            throw new Error('Failed to remove item from cart');
        }

        return await response.json();
    } catch (error) {
        console.error('Error removing item from cart:', error);
        throw error;
    }
};

export const checkout = async (userId) => {
    try {
        const response = await fetch(`/api/cart/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
            throw new Error('Checkout failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Error during checkout:', error);
        throw error;
    }
};