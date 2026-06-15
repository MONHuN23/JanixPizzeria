import React, { useContext } from 'react';
import { Plus } from 'lucide-react';
import { CartContext } from '../contexts/CartContext';

const PizzaCard = ({ pizza }) => {
    const { addToCart } = useContext(CartContext);

    // Provide a fallback placeholder if image is missing or just use the download endpoint
    const imageUrl = pizza.image ? `/api/pizzas/${pizza.id}/image` : 'https://placehold.co/600x400/eeeeee/999999?text=Pizza';

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col group">
            <div className="relative h-48 overflow-hidden bg-gray-50">
                <img 
                    src={imageUrl} 
                    alt={pizza.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found'; }}
                />
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{pizza.name}</h3>
                    <span className="font-semibold text-[#FF2D20]">${parseFloat(pizza.price).toFixed(2)}</span>
                </div>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">{pizza.description}</p>
                
                {pizza.toppings && pizza.toppings.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {pizza.toppings.map(t => (
                            <span key={t.id} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {t.name}
                            </span>
                        ))}
                    </div>
                )}
                
                <button 
                    onClick={() => addToCart(pizza)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors active:scale-[0.98]"
                >
                    <Plus className="w-4 h-4" />
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default PizzaCard;
