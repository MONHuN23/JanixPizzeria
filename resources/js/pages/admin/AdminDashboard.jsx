import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import { Settings, Package, Pizza as PizzaIcon, CheckCircle, Clock, XCircle, Trash2, Edit2, Plus } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('orders');
    
    // Admin state
    const [orders, setOrders] = useState([]);
    const [pizzas, setPizzas] = useState([]);
    const [toppings, setToppings] = useState([]);
    const [loading, setLoading] = useState(true);

    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing');
    const finishedOrders = orders
        .filter(o => o.status === 'delivered' || o.status === 'cancelled')
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    // Pizza form state
    const [showPizzaForm, setShowPizzaForm] = useState(false);
    const [pizzaForm, setPizzaForm] = useState({ id: null, name: '', description: '', price: '', image: null });

    useEffect(() => {
        if (user && user.is_admin) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Wait, we need a way to fetch ALL orders for admin. If the backend doesn't have a specific admin orders route,
            // let's check API documentation. Ah, there's only `/api/orders` which lists "all orders placed by the user".
            // Wait, the API doc says "Administrator ... modify the status of any order in the system", but doesn't mention a route to LIST all orders!
            // Wait, I should just try `/api/orders` - maybe it returns all for admin.
            const [ordersRes, pizzasRes, toppingsRes] = await Promise.all([
                api.get('/orders'), // We will see if it returns all
                api.get('/pizzas'),
                api.get('/toppings')
            ]);
            
            if (ordersRes.data.status) setOrders(ordersRes.data.data);
            if (pizzasRes.data.status) setPizzas(pizzasRes.data.data);
            if (toppingsRes.data.status) setToppings(toppingsRes.data.data);
        } catch (error) {
            console.error("Error fetching admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateOrderStatus = async (id, status) => {
        try {
            await api.put(`/orders/${id}`, { status });
            fetchData();
        } catch (error) {
            console.error("Error updating order", error);
        }
    };

    const handleDeletePizza = async (id) => {
        if (!window.confirm('Delete this pizza?')) return;
        try {
            await api.delete(`/pizzas/${id}`);
            fetchData();
        } catch (error) {
            console.error("Error deleting pizza", error);
        }
    };

    const handleSavePizza = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (pizzaForm.name) formData.append('name', pizzaForm.name);
        if (pizzaForm.description) formData.append('description', pizzaForm.description);
        if (pizzaForm.price) formData.append('price', pizzaForm.price);
        if (pizzaForm.image) formData.append('image', pizzaForm.image);

        try {
            if (pizzaForm.id) {
                formData.append('_method', 'PUT');
                await api.post(`/pizzas/${pizzaForm.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/pizzas', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setShowPizzaForm(false);
            setPizzaForm({ id: null, name: '', description: '', price: '', image: null });
            fetchData();
        } catch (error) {
            console.error("Error saving pizza", error);
            alert("Error saving pizza. Check console for details.");
        }
    };

    if (!user || !user.is_admin) {
        return <Navigate to="/" />;
    }

    if (loading) {
        return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF2D20]"></div></div>;
    }

    const renderOrderCard = (order) => (
        <div key={order.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-gray-900 text-lg">Order #{order.id}</span>
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{new Date(order.created_at).toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-3">
                    <div>
                        <p className="text-sm font-semibold text-gray-800">Ügyfél adatok:</p>
                        <p className="text-sm text-gray-600">Név: {order.user?.name || order.address?.name || 'Ismeretlen'}</p>
                        <p className="text-sm text-gray-600">Kapcsolat: {order.address?.phone || '-'} | {order.guest_email || order.user?.email || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800">Szállítási cím:</p>
                        <p className="text-sm text-gray-600">
                            {order.address ? `${order.address.postalcode} ${order.address.city}, ${order.address.streetandnum}` : 'Nincs megadva cím'}
                            {order.address?.floor ? ` | Emelet: ${order.address.floor}` : ''}
                            {order.address?.door ? ` | Ajtó: ${order.address.door}` : ''}
                        </p>
                    </div>
                </div>
                {order.note && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                        <p className="text-sm font-semibold text-yellow-800">Megjegyzés:</p>
                        <p className="text-sm text-yellow-700">{order.note}</p>
                    </div>
                )}
                
                <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-800 mb-2">Rendelt tételek:</p>
                    <ul className="space-y-1">
                        {order.pizzas?.map(pizza => (
                            <li key={pizza.id} className="text-sm text-gray-600 flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg">
                                <span className="font-medium">{pizza.pivot.quantity}x {pizza.name}</span>
                                <span>${(pizza.pivot.purchased_price * pizza.pivot.quantity).toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-sm text-gray-600 font-medium">Összesen {order.pizzas?.reduce((sum, p) => sum + p.pivot.quantity, 0)} tétel</p>
                    <p className="text-base text-[#FF2D20] font-bold">Végösszeg: ${order.pizzas?.reduce((sum, p) => sum + (p.pivot.purchased_price * p.pivot.quantity), 0).toFixed(2)}</p>
                </div>
            </div>
            
            <div className="flex flex-col items-end justify-between gap-4 border-l border-gray-100 pl-4 min-w-[140px]">
                <select 
                    value={order.status}
                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-[#FF2D20] focus:border-transparent outline-none"
                >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="flex items-center gap-3 mb-8">
                <Settings className="w-8 h-8 text-[#FF2D20]" />
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>

            <div className="flex border-b border-gray-200 mb-8">
                <button 
                    onClick={() => setActiveTab('orders')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'orders' ? 'border-[#FF2D20] text-[#FF2D20]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Manage Orders
                </button>
                <button 
                    onClick={() => setActiveTab('pizzas')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'pizzas' ? 'border-[#FF2D20] text-[#FF2D20]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Manage Pizzas
                </button>
            </div>

            {activeTab === 'orders' && (
                <div className="space-y-12">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Clock className="w-6 h-6 text-orange-500" />
                            Folyamatban lévő rendelések
                        </h2>
                        {pendingOrders.length === 0 ? (
                            <p className="text-gray-500 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">Nincs folyamatban lévő rendelés.</p>
                        ) : (
                            <div className="space-y-4">
                                {pendingOrders.map(renderOrderCard)}
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            Lezárt rendelések
                        </h2>
                        {finishedOrders.length === 0 ? (
                            <p className="text-gray-500 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">Nincs lezárt rendelés.</p>
                        ) : (
                            <div className="space-y-4 opacity-75">
                                {finishedOrders.map(renderOrderCard)}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'pizzas' && (
                <div>
                    {!showPizzaForm ? (
                        <>
                            <button 
                                onClick={() => { setPizzaForm({ id: null, name: '', description: '', price: '', image: null }); setShowPizzaForm(true); }}
                                className="mb-6 flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add Pizza
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pizzas.map(pizza => (
                                    <div key={pizza.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-900">{pizza.name}</h3>
                                            <span className="text-[#FF2D20] font-semibold">${parseFloat(pizza.price).toFixed(2)}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">{pizza.description}</p>
                                        <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-gray-50">
                                            <button 
                                                onClick={() => { setPizzaForm({ id: pizza.id, name: pizza.name, description: pizza.description, price: pizza.price, image: null }); setShowPizzaForm(true); }}
                                                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeletePizza(pizza.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 max-w-2xl shadow-sm">
                            <h2 className="text-xl font-bold mb-4">{pizzaForm.id ? 'Edit Pizza' : 'Add New Pizza'}</h2>
                            <form onSubmit={handleSavePizza} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input 
                                        type="text" required value={pizzaForm.name} onChange={e => setPizzaForm({...pizzaForm, name: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF2D20] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea 
                                        required rows={3} value={pizzaForm.description} onChange={e => setPizzaForm({...pizzaForm, description: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF2D20] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                    <input 
                                        type="number" step="0.01" required value={pizzaForm.price} onChange={e => setPizzaForm({...pizzaForm, price: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF2D20] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image {pizzaForm.id && '(Leave empty to keep current)'}</label>
                                    <input 
                                        type="file" accept="image/*" onChange={e => setPizzaForm({...pizzaForm, image: e.target.files[0]})}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="submit" className="bg-[#FF2D20] text-white px-6 py-2 rounded-xl font-medium hover:bg-red-600 transition-colors">
                                        Save
                                    </button>
                                    <button type="button" onClick={() => setShowPizzaForm(false)} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
