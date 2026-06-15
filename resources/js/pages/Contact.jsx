import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Contact = () => {
    return (
        <div className="max-w-6xl mx-auto py-12 px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Kapcsolat</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
                {/* Information Section */}
                <div className="h-full flex flex-col">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Elérhetőségeink</h2>
                        
                        <div className="space-y-6 flex-grow flex flex-col justify-between">
                            <div className="flex items-start gap-4">
                                <div className="bg-red-50 p-3 rounded-full text-[#FF2D20]">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Cím</h3>
                                    <p className="text-gray-600">3300 Eger, Barkóczy u. 7.</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="bg-red-50 p-3 rounded-full text-[#FF2D20]">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Telefon</h3>
                                    <p className="text-gray-600">+36 20 234 4292</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="bg-red-50 p-3 rounded-full text-[#FF2D20]">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">E-mail</h3>
                                    <p className="text-gray-600">info@alizzapizza.hu</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4 flex-grow">
                                <div className="bg-red-50 p-3 rounded-full text-[#FF2D20]">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div className="w-full">
                                    <h3 className="font-semibold text-gray-900 mb-2">Nyitvatartás</h3>
                                    <div className="space-y-2 text-gray-600 text-sm w-full pr-4">
                                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                            <span>Kedd - Szombat</span>
                                            <span className="font-medium text-gray-900">11:00 - 22:00</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Vasárnap - Hétfő</span>
                                            <span className="font-medium text-[#FF2D20]">Zárva</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 h-full min-h-[450px] flex flex-col">
                    <iframe 
                        className="flex-grow w-full"
                        style={{ border: 0, borderRadius: '0.75rem' }} 
                        loading="lazy" 
                        allowFullScreen 
                        referrerPolicy="no-referrer-when-downgrade" 
                        src="https://maps.google.com/maps?q=Alizza+Pizza+Pizz%C3%A9ria,+Eger&t=&z=15&ie=UTF8&iwloc=&output=embed">
                    </iframe>
                </div>
            </div>
        </div>
    );
};

export default Contact;
