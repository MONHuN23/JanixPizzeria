import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#FF2D20] text-sm font-medium mb-4">
                <Flame className="w-4 h-4" />
                <span>Wood-fired perfection</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
                Authentic pizza, <br/>
                <span className="text-[#FF2D20]">delivered to you.</span>
            </h1>
            
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Experience the taste of Italy with our handcrafted pizzas made from the finest ingredients. Fast delivery, fresh out of the oven.
            </p>
            
            <div className="flex items-center gap-4 pt-4">
                <Link to="/menu" className="inline-flex items-center gap-2 bg-[#FF2D20] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-red-600 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-red-200">
                    Order Now
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
};

export default Home;
