import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import { Trash2, Clock } from 'lucide-react';

const Checkout = () => {
    const { cart, cartTotal, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
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

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [newAddress, setNewAddress] = useState({ name: '', phone: '', city: 'Eger', postalcode: 3300, streetandnum: '', floor: '', door: '' });
    const [orderNote, setOrderNote] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const checkIsOpen = () => {
        const now = new Date();
        const budapestTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Budapest" }));
        const day = budapestTime.getDay();
        const hours = budapestTime.getHours();
        const minutes = budapestTime.getMinutes();
        const time = hours + minutes / 60;
        
        let open = false;
        if (day >= 2 && day <= 6) { // Tue-Sat
            open = time >= 11 && time < 22;
        }
        return open;
    };

    const isActuallyOpen = checkIsOpen();
    const canOrder = isActuallyOpen || user?.is_admin;

    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
    }, [user]);

    const fetchAddresses = async () => {
        try {
            const response = await api.get('/addresses');
            if (response.data.status) {
                setAddresses(response.data.data);
                if (response.data.data.length > 0) {
                    setSelectedAddress(response.data.data[0].id);
                }
            }
        } catch (error) {
            console.error("Error fetching addresses", error);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        if (!newAddress.name.trim() || !newAddress.streetandnum.trim() || !newAddress.phone.trim()) return;
        
        try {
            const response = await api.post('/addresses', newAddress);
            if (response.data.status) {
                setNewAddress({ name: '', phone: '', city: 'Eger', postalcode: 3300, streetandnum: '', floor: '', door: '' });
                fetchAddresses();
            }
        } catch (error) {
            console.error("Error adding address", error);
        }
    };

    const handlePlaceOrder = async () => {
        if (user && !selectedAddress) {
            alert('Please select a delivery address');
            return;
        }

        if (!user) {
            if (!guestEmail.trim() || !newAddress.name.trim() || !newAddress.streetandnum.trim() || !newAddress.phone.trim()) {
                alert('Please fill out all required fields.');
                return;
            }
        }

        setLoading(true);
        try {
            const pizzas = cart.map(item => ({
                id: item.id,
                quantity: item.quantity
            }));
            
            const payload = {
                pizzas: pizzas,
                note: orderNote,
            };

            if (user) {
                payload.address_id = selectedAddress;
            } else {
                payload.guest_email = guestEmail;
                payload.address = newAddress;
            }

            const response = await api.post('/orders', payload);

            if (response.data.status) {
                clearCart();
                if (user) {
                    navigate('/dashboard', { state: { message: 'Sikeres rendelés!' } });
                } else {
                    alert('Sikeres rendelés! Hamarosan szállítjuk a pizzát!');
                    navigate('/');
                }
            }
        } catch (error) {
            console.error("Error placing order", error);
            if (error.response && error.response.data && error.response.data.message) {
                alert(`Failed to place order: ${error.response.data.message}\n` + JSON.stringify(error.response.data.errors || {}));
            } else {
                alert('Failed to place order.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added any pizzas yet.</p>
                <Link to="/menu" className="bg-[#FF2D20] text-white px-6 py-3 rounded-xl font-medium hover:bg-red-600 transition-colors">
                    Browse Menu
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                    <div className="space-y-4">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0">
                                <img 
                                    src={item.image ? `/api/pizzas/${item.id}/image` : 'https://placehold.co/100x100/eeeeee/999999?text=Pizza'} 
                                    alt={item.name} 
                                    className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-grow">
                                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                                    <p className="text-sm text-gray-500">${parseFloat(item.price).toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="px-3 py-1 hover:bg-gray-100 rounded-l-lg transition-colors"
                                        >-</button>
                                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="px-3 py-1 hover:bg-gray-100 rounded-r-lg transition-colors"
                                        >+</button>
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(item.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {!user ? (
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Vendég Vásárlás</h2>
                            <Link to="/login" className="text-sm font-medium text-[#FF2D20] hover:underline">Van már fiókod? Lépj be!</Link>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">E-mail cím *</label>
                                <input type="email" required value={guestEmail} onChange={e => setGuestEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF2D20] focus:border-transparent outline-none" placeholder="pelda@email.com" />
                            </div>
                            <div className="pt-4 mt-2 border-t border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 mb-4">Szállítási Adatok</h3>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Név *</label>
                                    <input type="text" required value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF2D20] focus:border-transparent outline-none" placeholder="Teljes Név" />
                                </div>
                                <div className="mt-3">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Telefonszám *</label>
                                    <input type="text" required value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF2D20] focus:border-transparent outline-none" placeholder="+36 30 123 4567" />
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-3">
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
                                <div className="mt-3">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Utca és házszám *</label>
                                    <input type="text" required value={newAddress.streetandnum} onChange={e => setNewAddress({...newAddress, streetandnum: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF2D20] focus:border-transparent outline-none" placeholder="Példa utca 12." />
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Emelet</label>
                                        <input type="number" value={newAddress.floor || ''} onChange={e => setNewAddress({...newAddress, floor: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF2D20] focus:border-transparent outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Ajtó</label>
                                        <input type="number" value={newAddress.door || ''} onChange={e => setNewAddress({...newAddress, door: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF2D20] focus:border-transparent outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4">Szállítási cím kiválasztása</h2>
                            {addresses.length > 0 ? (
                                <div className="space-y-3">
                                    {addresses.map(addr => (
                                        <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${selectedAddress === addr.id ? 'border-[#FF2D20] bg-red-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                                            <input 
                                                type="radio" 
                                                name="address" 
                                                value={addr.id}
                                                checked={selectedAddress === addr.id}
                                                onChange={() => setSelectedAddress(addr.id)}
                                                className="mt-1 text-[#FF2D20] focus:ring-[#FF2D20]"
                                            />
                                            <div>
                                                <span className="text-gray-900 font-medium block">{addr.name}</span>
                                                <span className="text-gray-500 text-sm">{addr.postalcode} {addr.city}, {addr.streetandnum} {addr.floor ? `Emelet: ${addr.floor} ` : ''}{addr.door ? `Ajtó: ${addr.door}` : ''}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 mb-4">Még nincsenek elmentett címeid. Kérlek adj hozzá egyet alább!</p>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6">
                            <h2 className="text-lg font-semibold mb-4">Megjegyzés a rendeléshez</h2>
                            <textarea 
                                value={orderNote}
                                onChange={(e) => setOrderNote(e.target.value)}
                                placeholder="Pl. kapucsengő 12, nem működik a lift, stb."
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF2D20] focus:border-transparent outline-none resize-none h-24"
                            ></textarea>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6">
                            <form onSubmit={handleAddAddress}>
                                <h2 className="text-lg font-semibold mb-4">Új cím hozzáadása</h2>
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
                                        Cím hozzáadása
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </div>

            <div className="md:col-span-1">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
                    <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                    <div className="space-y-3 text-sm text-gray-600 mb-4 border-b border-gray-100 pb-4">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Delivery</span>
                            <span>Free</span>
                        </div>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-gray-900 mb-6">
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    
                    {!isActuallyOpen && !user?.is_admin && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                            <Clock className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700 font-medium leading-snug">Jelenleg zárva vagyunk! Rendelést csak nyitvatartási időben veszünk fel.</p>
                        </div>
                    )}
                    
                    {!isActuallyOpen && user?.is_admin && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                            <Clock className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-yellow-800 font-medium leading-snug">Jelenleg zárva vagytok, de Admin-ként leadhatsz teszt rendelést.</p>
                        </div>
                    )}

                    <button 
                        onClick={handlePlaceOrder}
                        disabled={loading || !canOrder}
                        className="w-full bg-[#FF2D20] text-white py-3 rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                        {loading ? 'Processing...' : 'Place Order'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
