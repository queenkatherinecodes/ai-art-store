import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    CircularProgress,
    IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getProduct } from '../services/productService';
import { checkout } from '../services/cartService';

const StyledContainer = styled(Container)(({ theme }) => ({
    backgroundColor: 'var(--bg-color)',
    color: 'var(--text-color)',
    padding: theme.spacing(4),
    transition: 'background-color 0.3s ease, color 0.3s ease',
}));

const StyledCard = styled(Card)(({ theme }) => ({
    backgroundColor: 'var(--card-bg-color)',
    color: 'var(--text-color)',
    boxShadow: '0 4px 15px var(--shadow-color)',
    transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
}));

const StyledButton = styled(Button)(({ theme }) => ({
    backgroundColor: 'var(--button-bg-color)',
    color: 'var(--button-text-color)',
    '&:hover': {
        backgroundColor: '#e61e14',
    },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiInputBase-input': {
        color: 'var(--text-color)',
    },
    '& .MuiInputLabel-root': {
        color: 'var(--text-color)',
    },
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
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    color: 'var(--text-color)',
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiPaper-root': {
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
    },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    color: 'var(--text-color)',
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    color: 'var(--text-color)',
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
    backgroundColor: 'var(--bg-color)',
}));

const CheckoutPage = () => {
    const [products, setProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const [paymentInfo, setPaymentInfo] = useState({ cardNumber: '', expiryDate: '', cvv: '' });
    const [errors, setErrors] = useState({ cardNumber: '', expiryDate: '', cvv: '' });
    const [thankYouOpen, setThankYouOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const { user } = useAuth();
    const { cart, cartCount, clearCart, handleRemoveFromCart } = useCart();
    const navigate = useNavigate();

    const ITEM_PRICE = 10; // Fixed price for all posters

    useEffect(() => {
        if (cartCount > 0) {
            fetchProducts();
        } else {
            setLoading(false);
        }
    }, [cartCount]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const productPromises = cart.map(item => getProduct(item.productId));
            const productDetails = await Promise.all(productPromises);
            const productsMap = productDetails.reduce((acc, product) => {
                if (product) {
                    acc[product.id] = product;
                }
                return acc;
            }, {});
            setProducts(productsMap);
        } catch (error) {
            console.error('Error fetching product details:', error);
            setSnackbar({ open: true, message: 'Error fetching some product details.' });
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentInfoChange = (e) => {
        const { name, value } = e.target;
        setPaymentInfo({ ...paymentInfo, [name]: value });
        validateField(name, value);
    };

    const validateField = (fieldName, value) => {
        let errorMessage = '';
        switch (fieldName) {
            case 'cardNumber':
                errorMessage = /^\d{16}$/.test(value) ? '' : 'Card number must be 16 digits';
                break;
            case 'cvv':
                errorMessage = /^\d{3}$/.test(value) ? '' : 'CVV must be 3 digits';
                break;
            case 'expiryDate':
                const [month, year] = value.split('/');
                const currentYear = new Date().getFullYear() % 100; // Get last two digits of current year
                if (!/^\d{2}\/\d{2}$/.test(value)) {
                    errorMessage = 'Expiry date must be in MM/YY format';
                } else if (parseInt(month) < 1 || parseInt(month) > 12) {
                    errorMessage = 'Invalid month';
                } else if (parseInt(year) < currentYear) {
                    errorMessage = 'Card has expired';
                }
                break;
            default:
                break;
        }
        setErrors(prevErrors => ({ ...prevErrors, [fieldName]: errorMessage }));
    };

    const handleCheckout = async () => {
        // Validate all fields before proceeding
        validateField('cardNumber', paymentInfo.cardNumber);
        validateField('cvv', paymentInfo.cvv);
        validateField('expiryDate', paymentInfo.expiryDate);

        // Check if there are any errors
        if (Object.values(errors).some(error => error !== '')) {
            setSnackbar({
                open: true,
                message: 'Please correct the errors in the payment form.'
            });
            return;
        }

        try {
            const result = await checkout(user.id, cart);
            if (result) {
                clearCart();
                setThankYouOpen(true);
            } else {
                throw new Error('Checkout failed');
            }
        } catch (error) {
            console.error('Error during checkout:', error);
            setSnackbar({
                open: true,
                message: `Checkout failed: ${error.message}. Please try again.`
            });
        }
    };

    const handleThankYouClose = () => {
        setThankYouOpen(false);
        navigate('/');
    };

    const calculateTotal = () => {
        return cartCount * ITEM_PRICE;
    };

    const handleRemoveItem = async (productId) => {
        try {
            await handleRemoveFromCart(productId);
            setSnackbar({ open: true, message: 'Item removed from cart' });
            // If the cart becomes empty after removing an item, refetch products
            if (cartCount === 1) {
                setProducts({});
                setLoading(false);
            } else {
                // Remove the product from the local state
                setProducts(prevProducts => {
                    const newProducts = { ...prevProducts };
                    delete newProducts[productId];
                    return newProducts;
                });
            }
        } catch (error) {
            console.error('Error removing item from cart:', error);
            setSnackbar({ open: true, message: 'Error removing item from cart' });
        }
    };

    if (loading) {
        return (
            <StyledContainer sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </StyledContainer>
        );
    }

    return (
        <StyledContainer maxWidth="md">
            <StyledTypography variant="h4" gutterBottom>Checkout</StyledTypography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    {cartCount === 0 ? (
                        <StyledTypography>Your cart is empty.</StyledTypography>
                    ) : (
                        cart.map((item) => {
                            const product = products[item.productId];
                            if (!product) return null;
                            return (
                                <StyledCard key={item.productId} sx={{ display: 'flex', mb: 2 }}>
                                    <CardMedia
                                        component="img"
                                        sx={{ width: 100 }}
                                        image={product.imageUrl || '/placeholder-image.jpg'}
                                        alt={product.title || 'Product image'}
                                    />
                                    <CardContent sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <StyledTypography variant="h6">{product.title || 'Unknown Poster'}</StyledTypography>
                                            <StyledTypography variant="body2">
                                                ${ITEM_PRICE.toFixed(2)}
                                            </StyledTypography>
                                            <StyledTypography variant="body2">
                                                One-of-a-kind poster
                                            </StyledTypography>
                                        </div>
                                        <IconButton onClick={() => handleRemoveItem(item.productId)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </CardContent>
                                </StyledCard>
                            );
                        })
                    )}
                    <StyledTypography variant="h6" align="right" sx={{ mt: 2 }}>
                        Total: ${calculateTotal().toFixed(2)}
                    </StyledTypography>
                </Grid>
                <Grid item xs={12} md={4}>
                    <StyledCard>
                        <CardContent>
                            <StyledTypography variant="h6" gutterBottom>Payment Information</StyledTypography>
                            <StyledTextField
                                fullWidth
                                label="Card Number"
                                name="cardNumber"
                                value={paymentInfo.cardNumber}
                                onChange={handlePaymentInfoChange}
                                error={!!errors.cardNumber}
                                helperText={errors.cardNumber}
                                margin="normal"
                            />
                            <StyledTextField
                                fullWidth
                                label="Expiry Date (MM/YY)"
                                name="expiryDate"
                                value={paymentInfo.expiryDate}
                                onChange={handlePaymentInfoChange}
                                error={!!errors.expiryDate}
                                helperText={errors.expiryDate}
                                margin="normal"
                            />
                            <StyledTextField
                                fullWidth
                                label="CVV"
                                name="cvv"
                                value={paymentInfo.cvv}
                                onChange={handlePaymentInfoChange}
                                error={!!errors.cvv}
                                helperText={errors.cvv}
                                margin="normal"
                            />
                            <StyledButton
                                fullWidth
                                variant="contained"
                                onClick={handleCheckout}
                                sx={{ mt: 2 }}
                                disabled={cartCount === 0 || Object.values(errors).some(error => error !== '')}
                            >
                                Place Order
                            </StyledButton>
                        </CardContent>
                    </StyledCard>
                </Grid>
            </Grid>
            <StyledDialog open={thankYouOpen} onClose={handleThankYouClose}>
                <StyledDialogTitle>Thank You for Your Order!</StyledDialogTitle>
                <StyledDialogContent>
                    <StyledTypography>Your order has been placed. Thank you for shopping at ai art, where art meets ai.</StyledTypography>
                </StyledDialogContent>
                <StyledDialogActions>
                    <StyledButton onClick={handleThankYouClose} color="primary">close</StyledButton>
                </StyledDialogActions>
            </StyledDialog>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
            />
        </StyledContainer>
    );
};

export default CheckoutPage;