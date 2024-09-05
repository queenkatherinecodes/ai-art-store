import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    TextField,
    Button,
    Typography,
    Grid,
    Box,
    Snackbar,
    IconButton,
    CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';

const ManagePage = () => {
    const [products, setProducts] = useState([]);
    const [newProductPrompt, setNewProductPrompt] = useState('');
    const [loading, setLoading] = useState(true);
    const [addingProduct, setAddingProduct] = useState(false);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/products');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to fetch products. Please try again later.');
            setSnackbar({ open: true, message: 'Error fetching products. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async () => {
        if (!newProductPrompt) {
            setSnackbar({ open: true, message: 'Prompt cannot be empty!' });
            return;
        }

        setAddingProduct(true);
        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: newProductPrompt }),
            });

            if (!response.ok) {
                throw new Error('Failed to add product');
            }

            const addedProduct = await response.json();
            setProducts([...products, addedProduct]);
            setNewProductPrompt('');
            setSnackbar({ open: true, message: 'Product added successfully!' });
        } catch (error) {
            console.error('Error adding product:', error);
            setSnackbar({ open: true, message: 'Error adding product. Please try again.' });
        } finally {
            setAddingProduct(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete product');
            }

            setProducts(products.filter(product => product.id !== productId));
            setSnackbar({ open: true, message: 'Product deleted successfully!' });
        } catch (error) {
            console.error('Error deleting product:', error);
            setSnackbar({ open: true, message: 'Error deleting product. Please try again.' });
        }
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
        <Container maxWidth="md" sx={{ py: 4 }}>
            <h1 className="admin-title">Product Management Dashboard</h1>
            <Box mb={4}>
                <Typography variant="h6" sx={{ color: 'var(--text-color)' }}>Add New Product</Typography>
                <TextField
                    label="Product Prompt"
                    variant="outlined"
                    fullWidth
                    value={newProductPrompt}
                    onChange={(e) => setNewProductPrompt(e.target.value)}
                    disabled={addingProduct}
                    sx={{
                        my: 2,
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: 'var(--input-border-color)',
                            },
                            '&:hover fieldset': {
                                borderColor: 'var(--accent-color)',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'var(--accent-color)',
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: 'var(--text-color)',
                        },
                        '& .MuiInputBase-input': {
                            color: 'var(--text-color)',
                            backgroundColor: 'var(--input-bg-color)',
                        },
                    }}
                />
                <Button 
                    variant="contained" 
                    onClick={handleAddProduct}
                    disabled={addingProduct}
                    sx={{
                        backgroundColor: 'var(--button-bg-color)',
                        color: 'var(--button-text-color)',
                        '&:hover': {
                            backgroundColor: 'var(--accent-color)',
                        },
                        '&.Mui-disabled': {
                            backgroundColor: 'var(--accent-color)',
                            color: 'var(--text-color)',
                        },
                        minWidth: '140px',
                        height: '40px', 
                    }}
                >
                    {addingProduct ? (
                        <CircularProgress size={24} sx={{ color: 'var(--text-color)' }} />
                    ) : (
                        'Add Product'
                    )}
                </Button>
            </Box>
            <Typography variant="h6" gutterBottom sx={{ color: 'var(--text-color)' }}>
                Product List
            </Typography>
            {products.length > 0 ? (
                <Grid container spacing={2}>
                    {products.map((product) => (
                        <Grid item xs={12} sm={6} md={4} key={product.id}>
                            <Box 
                                display="flex" 
                                justifyContent="space-between" 
                                alignItems="center"
                                sx={{
                                    backgroundColor: 'var(--card-bg-color)',
                                    padding: '1rem',
                                    borderRadius: '5px',
                                    boxShadow: '0 2px 5px var(--shadow-color)',
                                }}
                            >
                                <Typography variant="body1" sx={{ color: 'var(--text-color)' }}>
                                    {product.title}
                                </Typography>
                                <IconButton 
                                    onClick={() => handleDeleteProduct(product.id)}
                                    sx={{ color: 'var(--accent-color)' }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography sx={{ color: 'var(--text-color)' }}>No products available.</Typography>
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

export default ManagePage;