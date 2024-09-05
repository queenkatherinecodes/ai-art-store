import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const GalleryPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shuffledProducts, setShuffledProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('/api/products');
                const fetchedProducts = response.data;
                setProducts(fetchedProducts);
                setShuffledProducts(shuffleArray(fetchedProducts)); // Initial shuffle
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Failed to load images.');
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setShuffledProducts(prevProducts => shuffleArray(prevProducts));
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader2 className="animate-spin gallery-loading" size={24} />
    </div>;
    if (error) return <div className="gallery-error">{error}</div>;

    return (
        <div className="gallery-container">
            <audio src="/assets/gallery_loop.wav" autoPlay loop />
            {shuffledProducts.map((product, index) => (
                <div key={product.id || index} className="gallery-item">
                    <img src={product.imageUrl} alt={`Product ${index}`} className="gallery-image" />
                </div>
            ))}
        </div>
    );
};

export default GalleryPage;
