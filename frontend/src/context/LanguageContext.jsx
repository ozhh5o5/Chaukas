import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');
    const [cache, setCache] = useState({}); // { 'hi': { 'Hello': 'Namaste' } }

    useEffect(() => {
        const saved = localStorage.getItem('appLanguage');
        if (saved) {
            setLanguage(saved);
        }
        // Load cache from local storage if needed? For now memory cache is safest.
    }, []);

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('appLanguage', lang);
    };

    const translateText = useCallback(async (text) => {
        if (!text) return "";
        if (language === 'en') return text;

        // Check cache
        if (cache[language] && cache[language][text]) {
            return cache[language][text];
        }

        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    language: language
                })
            });

            if (!response.ok) {
                console.warn("Translation API not ok:", response.status);
                return text;
            }

            const data = await response.json();
            const translated = data.translated_text || text;

            // Update Cache
            setCache(prev => ({
                ...prev,
                [language]: {
                    ...(prev[language] || {}),
                    [text]: translated
                }
            }));

            return translated;
        } catch (error) {
            console.error("Translation error:", error);
            return text;
        }
    }, [language, cache]);

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, translateText }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
