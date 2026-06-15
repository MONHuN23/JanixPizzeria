import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Pizza, Settings, Menu as MenuIcon, X } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartCount } = useContext(CartContext);
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Toggle */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-1 -ml-1 text-gray-600 hover:text-gray-900 focus:outline-none"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                    </button>

                    <Link to="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight text-gray-900">
                        <Pizza className="text-[#FF2D20]" />
                        <span>Alizza</span>
                    </Link>
                    
                    <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-600 ml-4">
                        <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
                        <Link to="/menu" className="hover:text-gray-900 transition-colors">Menu</Link>
                        <Link to="/contact" className="hover:text-gray-900 transition-colors">Kapcsolat</Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/checkout" className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <ShoppingCart className="w-5 h-5" />
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-[#FF2D20] rounded-full transform translate-x-1/4 -translate-y-1/4">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-4">
                            {user.is_admin ? (
                                <Link to="/admin" className="text-gray-600 hover:text-gray-900" title="Admin Dashboard">
                                    <Settings className="w-5 h-5" />
                                </Link>
                            ) : null}
                            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 flex items-center gap-1 text-sm font-medium">
                                <User className="w-4 h-4" />
                                <span className="hidden sm:inline">{user.name}</span>
                            </Link>
                            <button onClick={handleLogout} className="text-gray-600 hover:text-[#FF2D20] transition-colors" title="Logout">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 text-sm font-medium">
                            <Link to="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
                            <Link to="/register" className="bg-[#FF2D20] text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white">
                    <nav className="flex flex-col px-4 pt-2 pb-4 space-y-3">
                        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:text-gray-900 font-medium px-2 py-1">Home</Link>
                        <Link to="/menu" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:text-gray-900 font-medium px-2 py-1">Menu</Link>
                        <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:text-gray-900 font-medium px-2 py-1">Kapcsolat</Link>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Navbar;
