'use client';

import { useState, useEffect, useRef } from 'react';

interface Cie10SearchProps {
    onSelect: (item: { code: string; description: string }) => void;
    placeholder?: string;
    defaultValue?: string;
    className?: string;
}

export default function Cie10Search({ onSelect, placeholder = 'Buscar diagnóstico (CIE-10)...', defaultValue = '', className = '' }: Cie10SearchProps) {
    const [query, setQuery] = useState(defaultValue);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) { // Allow searching shorter codes like 'J00'
                searchCie10(query);
            } else {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const searchCie10 = async (q: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/cie10?q=${q}`);
            if (res.ok) {
                setSuggestions(await res.json());
                setShowSuggestions(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (item: any) => {
        setQuery(item.code);
        onSelect(item);
        setShowSuggestions(false);
    };

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                placeholder={placeholder}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
            {loading && (
                <div className="absolute right-3 top-3">
                    <div className="animate-spin h-4 w-4 border-2 border-purple-500 rounded-full border-t-transparent"></div>
                </div>
            )}

            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                    {suggestions.map((item) => (
                        <li
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className="p-3 hover:bg-purple-50 cursor-pointer border-b border-slate-50 last:border-none"
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-purple-700 font-mono text-sm">{item.code}</span>
                            </div>
                            <p className="text-sm text-slate-700 mt-1 line-clamp-1">{item.description}</p>
                        </li>
                    ))}
                </ul>
            )}

            {showSuggestions && suggestions.length === 0 && query.length >= 2 && !loading && (
                <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 p-3 text-center text-sm text-slate-500">
                    No se encontraron resultados
                </div>
            )}
        </div>
    );
}
