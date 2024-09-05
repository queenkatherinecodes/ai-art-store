export const getProduct = async (productId) => {
    try {
        if (!productId) {
            throw new Error(`Invalid product ID: ${productId}`);
        }
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Product not found: ${productId}`);
            }
            throw new Error(`Failed to fetch product: ${productId}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching product ${productId}:`, error);
        throw error;
    }
};