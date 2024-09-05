import React from 'react';
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import '../public/styles/global.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { PrivateRoute } from './components/PrivateRoute';
import ThemeWrapper from './components/ThemeWrapper';
import Navigation from './components/Navigation';
import { Loader2 } from 'lucide-react';

// Lazy loaded components
const LandingPage = lazy(() => import('./pages/LandingPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));
const ManagePage = lazy(() => import('./pages/ManagePage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));

// Loading fallback component
const LoadingFallback = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader2 className="animate-spin" size={24} />
    </div>
);

const AppContent = () => {
    const { isLoading } = useAuth();

    if (isLoading) {
        return <LoadingFallback />;
    }

    return (
        <Router>
            <div className="App">
                <Navigation />
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/unauthorized" element={<UnauthorizedPage />} />
                        {/* Protected routes */}
                        <Route element={<PrivateRoute />}>
                            <Route path="/gallery" element={<GalleryPage />} />
                            <Route path="/reviews" element={<ReviewsPage />} />
                            <Route path="/contact" element={<ContactPage />} />
                            <Route path="/checkout" element={<CheckoutPage />} />
                        </Route>

                        {/* Admin-only route */}
                        <Route element={<PrivateRoute adminOnly />}>
                            <Route path="/admin" element={<AdminPage />} />
                            <Route path="/manage" element={<ManagePage />} />
                        </Route>
                    </Routes>
                </Suspense>
            </div>
        </Router>
    );
};

function App() {
    return (
        <AuthProvider>
            <ThemeWrapper>
                <CartProvider>
                    <AppContent />
                </CartProvider>
            </ThemeWrapper>
        </AuthProvider>
    );
}

export default App;
