
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Checkout from './pages/Checkout';
import UserDashboard from './pages/user/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Contact from './pages/Contact';

const App = () => {
    return (
        <AuthProvider>
            <CartProvider>
                <BrowserRouter>
                    <div className="min-h-screen flex flex-col bg-gray-50">
                        <Navbar />
                        <main className="flex-grow container mx-auto px-4 py-8">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/menu" element={<Menu />} />
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/checkout" element={<Checkout />} />
                                <Route path="/dashboard" element={<UserDashboard />} />
                                <Route path="/admin" element={<AdminDashboard />} />
                            </Routes>
                        </main>
                        <footer className="bg-white border-t border-gray-200 py-6 text-center text-gray-500">
                            &copy; {new Date().getFullYear()} Alizza Pizzeria. All rights reserved.
                        </footer>
                    </div>
                </BrowserRouter>
            </CartProvider>
        </AuthProvider>
    );
};

if (document.getElementById('root')) {
    const root = createRoot(document.getElementById('root'));
    root.render(<App />);
}
