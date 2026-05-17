import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react'; // Assuming lucide-react is used, if not I'll remove icon or check package.json

const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'mr', label: 'मराठी' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'bn', label: 'বাংলা' }
];

const LanguageSelector = () => {
    const { language, changeLanguage } = useLanguage();

    return (
        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-lg px-3 py-1 border border-white/20">
            {/* Simple Globe Icon SVG inline to avoid dependency issues if lucide not installed */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>

            <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent text-white text-sm focus:outline-none cursor-pointer [&>option]:text-black"
                aria-label="Select Language"
            >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default LanguageSelector;
