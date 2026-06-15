import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const Register = () => {
    const { register, login } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await register(name, email, password);
            if (response.status) {
                // Auto login after register
                await login(email, password);
                navigate('/dashboard');
            } else {
                setError(response.message || 'Registration failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
                <p className="text-gray-500 mt-2">Join Alizza Pizzeria today.</p>
            </div>
            
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF2D20] focus:border-transparent outline-none transition-all"
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF2D20] focus:border-transparent outline-none transition-all"
                        placeholder="you@example.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input 
                        type="password" 
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF2D20] focus:border-transparent outline-none transition-all"
                        placeholder="••••••••"
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-[#FF2D20] text-white py-3 rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-70 mt-4"
                >
                    {loading ? 'Creating account...' : 'Create account'}
                </button>
            </form>
            
            <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account? <Link to="/login" className="text-[#FF2D20] font-medium hover:underline">Sign in</Link>
            </p>
        </div>
    );
};

export default Register;
