import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Moon, Sun, LogOut, ShoppingCart } from 'lucide-react';

function Navigation() {
    const { isDarkMode, toggleTheme } = useTheme();
    const { isAuthenticated, isAdmin, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="navigation">
            <div className="nav-logo">
                <Link to="/">ai art</Link>
            </div>
            <ul className="nav-links">
                {isAuthenticated && (
                    <>
                        <li><Link to="/products">products</Link></li>
                        <li><Link to="/gallery">gallery</Link></li>
                        <li><Link to="/reviews">reviews</Link></li>
                        <li><Link to="/contact">contact us</Link></li>
                    </>
                )}
                {isAdmin && (
                    <>
                        <li><Link to="/admin">admin</Link></li>
                        <li><Link to="/manage">manage products</Link></li>
                    </>
                )}
            </ul>
            <div className="nav-auth">
                {isAuthenticated ? (
                    <div className="nav-cart-logout">
                        <Link to="/checkout" className="cart-link">
                            <ShoppingCart className="cart-icon" />
                            {cartCount > 0 && (
                                <span className="cart-count">{cartCount}</span>
                            )}
                        </Link>
                        <Link to="/" onClick={handleLogout} className="logout-link">
                            <LogOut className="logout-icon" />
                        </Link>
                    </div>
                ) : (
                    <>
                        <Link to="/login">login</Link>
                        <Link to="/register">register</Link>
                    </>
                )}
                <button className="theme-toggle" onClick={toggleTheme} aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                    {isDarkMode ? (
                        <Sun className="theme-icon" />
                    ) : (
                        <Moon className="theme-icon" />
                    )}
                </button>
            </div>
        </nav>
    );
}

export default Navigation;