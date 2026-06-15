import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import { Trash2, MapPin, Package, Clock, CheckCircle, XCircle } from 'lucide-react';

const Dashboard = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    
    const CITIES = {
        'Eger': 3300,
        'Ostoros': 3326,
        'Novaj': 3327,
        'Andornaktálya': 3399,
        'Egerszalók': 3394,
        'Demjén': 3395,
        'Felsőtárkány': 3324,
        'Maklár': 3397,
        'Nagytálya': 3398
    };

    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [newAddress, setNewAddress] = useState({ name: '', phone: '', city: 'Eger', postalcode: 3300, streetandnum: '', floor: '', door: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, addressesRes] = await Promise.all([
                    api.get('/orders'),
                    api.get('/addresses')
                ]);
                
                if (ordersRes.data.status) setOrders(ordersRes.data.data);
                if (addressesRes.data.status) setAddresses(addressesRes.data.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    const handleAddAddress = async (e) => {
        e.preventDefault();
        if (!newAddress.name.trim() || !newAddress.streetandnum.trim() || !newAddress.phone.trim()) return;
        
        try {
            const response = await api.post('/addresses', newAddress);
            if (response.data.status) {
                setAddresses([...addresses, response.data.data]);
                setNewAddress({ name: '', phone: '', city: 'Eger', postalcode: 3300, streetandnum: '', floor: '', door: '' });
            }
        } catch (error) {
            console.error("Error adding address", error);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        try {
            await api.delete(`/addresses/${id}`);
            setAddresses(addresses.filter(a => a.id !== id));
        } catch (error) {
            console.error("Error deleting address", error);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4 text-orange-500" />;
            case 'processing': return <Package className="w-4 h-4 text-blue-500" />;
            case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return null;
        }
    };

    if (authLoading || (user && loading)) {
        return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF2D20]"></div></div>;
    }

    if (!user) return null;

    return (
        <div className="max-w-5xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
            <p className="text-gray-500 mb-8">Welcome back, {user?.name}</p>

            {location.state?.message && (
                <div className="mb-8 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {location.state.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Package className="w-5 h-5 text-[#FF2D20]" />
                        Order History
                    </h2>
                    
                    {orders.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
                            <p className="text-gray-500">You haven't placed any orders yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map(order => (
                                <div key={order.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-50">
                                        <div>
                                            <p className="text-sm text-gray-500">Order #{order.id}</p>
                                            <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm font-medium capitalize bg-gray-50 px-3 py-1 rounded-full">
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 mb-4">
                                        {order.pizzas?.map(pizza => (
                                            <div key={pizza.id} className="flex justify-between text-sm">
                                                <span className="text-gray-700">{pizza.pivot.quantity}x {pizza.name}</span>
                                                <span className="text-gray-500">${(pizza.pivot.purchased_price * pizza.pivot.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {order.address ? `${order.address.postalcode} ${order.address.city}, ${order.address.streetandnum}` : 'Unknown address'}
                                        </span>
                                        <span className="font-bold text-gray-900">
                                            Total: ${order.pizzas?.reduce((sum, p) => sum + (p.pivot.purchased_price * p.pivot.quantity), 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="md:col-span-1 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#FF2D20]" />
                        My Addresses
                    </h2>
                    
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        {addresses.length === 0 ? (
                            <p className="text-sm text-gray-500 mb-4">No saved addresses.</p>
                        ) : (
                            <div className="space-y-3 mb-6">
                                {addresses.map(addr => (
                                    <div key={addr.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div>
                                            <span className="text-sm font-medium text-gray-900 block">{addr.name}</span>
                                            <span className="text-xs text-gray-500 block">{addr.postalcode} {addr.city}, {addr.streetandnum} {addr.floor ? `Emelet: ${addr.floor} ` : ''}{addr.door ? `Ajtó: ${addr.door}` : ''}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteAddress(addr.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleAddAddress} className="pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">Add New Address</h3>
                            <div className="flex flex-col gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Név * (pl. Otthon, Munka)</label>
                                    <input type="text" required value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF2D20] focus:border-transparent outline-none" placeholder="Név" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Telefonszám *</label>
                                    <input type="text" required value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF2D20] focus:border-transparent outline-none" placeholder="+36 30 123 4567" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Város *</label>
                                        <select value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value, postalcode: CITIES[e.target.value]})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF2D20] focus:border-transparent outline-none">
                                            {Object.keys(CITIES).map(city => <option key={city} value={city}>{city}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Irányítószám *</label>
                                        <input type="number" readOnly value={newAddress.postalcode} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none text-gray-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Utca és házszám *</label>
                                    <input type="text" required value={newAddress.streetandnum} onChange={e => setNewAddress({...newAddress, streetandnum: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF2D20] focus:border-transparent outline-none" placeholder="Példa utca 12." />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Emelet</label>
                                        <input type="number" value={newAddress.floor || ''} onChange={e => setNewAddress({...newAddress, floor: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF2D20] focus:border-transparent outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Ajtó</label>
                                        <input type="number" value={newAddress.door || ''} onChange={e => setNewAddress({...newAddress, door: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF2D20] focus:border-transparent outline-none" />
                                    </div>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={!newAddress.name.trim() || !newAddress.streetandnum.trim() || !newAddress.phone.trim()}
                                    className="w-full mt-2 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                                >
                                    Cím mentése
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
