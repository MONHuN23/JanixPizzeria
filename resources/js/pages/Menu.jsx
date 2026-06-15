import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PizzaCard from '../components/PizzaCard';

const Menu = () => {
    const [pizzas, setPizzas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await api.get('/pizzas');
                if (response.data.status) {
                    setPizzas(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch menu", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF2D20]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Menu</h1>
                <p className="text-gray-500">Discover our handcrafted pizzas, baked to perfection.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pizzas.map(pizza => (
                    <PizzaCard key={pizza.id} pizza={pizza} />
                ))}
            </div>
        </div>
    );
};

export default Menu;
