import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Card, 
    CardContent, 
    CardMedia, 
    Typography, 
    Grid, 
    Container, 
    Snackbar, 
    IconButton, 
    Box,
    CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { animated, useSpring } from '@react-spring/web';
import SearchBar from '../components/SearchBar';

const ProductCard = ({ product, isInCart, onAddToCart, onRemoveFromCart }) => {
    const [props, set] = useSpring(() => ({
        scale: 1,
        shadow: 1,
        config: { mass: 5, tension: 350, friction: 40 }
    }));

    return (
        <animated.div
            style={{
                ...props,
                width: '100%',
                height: '100%',
            }}
            onMouseEnter={() => set({ scale: 1.05, shadow: 3 })}
            onMouseLeave={() => set({ scale: 1, shadow: 1 })}
        >
            <Card 
                sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--card-bg-color)', 
                    color: 'var(--text-color)', 
                    transition: 'background-color 0.3s ease, color 0.3s ease', 
                }}
            >
                <CardMedia
                    component="img"
                    height="200"
                    image={product.imageUrl}
                    alt={product.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div">
                        {product.title}
                    </Typography>
                    <Typography variant="body2" color="var(--text-color)">
                        $10.00
                    </Typography>
                </CardContent>
                <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {isInCart ? (
                        <IconButton
                            onClick={() => onRemoveFromCart(product)}
                            color="secondary"
                            size="medium"
                        >
                            <RemoveIcon />
                        </IconButton>
                    ) : (
                        <IconButton
                            onClick={() => onAddToCart(product)}
                            color="primary"
                            size="medium"
                        >
                            <AddIcon />
                        </IconButton>
                    )}
                </Box>
            </Card>
        </animated.div>
    );
};

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { cart, handleAddToCart, handleRemoveFromCart } = useCart();

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                navigate('/login');
            } else {
                fetchProducts();
            }
        }
    }, [authLoading, isAuthenticated, navigate]);

    useEffect(() => {
        const filtered = products.filter(product =>
            product.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(filtered);
    }, [searchTerm, products]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/products');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setProducts(data);
            setFilteredProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to fetch products. Please try again later.');
            setSnackbar({ open: true, message: 'Error fetching products. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCartClick = (product) => {
        if (!isAuthenticated) {
            setSnackbar({ open: true, message: 'Please log in to add items to cart.' });
            navigate('/login');
            return;
        }
        handleAddToCart(product.id, 1)
            .then(() => {
                setSnackbar({ open: true, message: 'Product added to cart!' });
            })
            .catch(() => {
                setSnackbar({ open: true, message: 'Error adding product to cart' });
            });
    };

    const handleRemoveFromCartClick = (product) => {
        if (!isAuthenticated) {
            setSnackbar({ open: true, message: 'Please log in to remove items from cart.' });
            navigate('/login');
            return;
        }
        handleRemoveFromCart(product.id)
            .then(() => {
                setSnackbar({ open: true, message: 'Product removed from cart!' });
            })
            .catch(() => {
                setSnackbar({ open: true, message: 'Error removing product from cart' });
            });
    };

    const isProductInCart = (productId) => {
        return cart.some(item => item.productId === productId);
    };

    if (authLoading || loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />
            {filteredProducts.length > 0 ? (
                <Grid container spacing={4} justifyContent="center">
                    {filteredProducts.map((product) => (
                        <Grid item key={product.id} xs={12} sm={6} md={4}>
                            <ProductCard
                                product={product}
                                isInCart={isProductInCart(product.id)}
                                onAddToCart={handleAddToCartClick}
                                onRemoveFromCart={handleRemoveFromCartClick}
                            />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography>No products available.</Typography>
            )}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
            />
        </Container>
    );
};

export default ProductsPage;