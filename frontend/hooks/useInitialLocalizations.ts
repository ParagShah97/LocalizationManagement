'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUIStore } from '@/store/uiStore';

// The main idea for this custom hook to pre-load the initial data and store in out store.


export const useInitialLocalizations = () => {
    const setProjects = useUIStore((s) => s.setAvailableProjects);
    const setLanguages = useUIStore((s) => s.setAvailableLanguages);

    const query = useQuery({
        queryKey: ['initial-localizations'],
        queryFn: async () => {
            const res = await fetch('http://127.0.0.1:8000/localizations/');
            if (!res.ok) throw new Error('Failed to fetch localizations');
            return res.json();
        },
        staleTime: Infinity,
        retry: 1,
    });

    useEffect(() => {
        if (query.data) {
            setProjects(query.data.projects);
            setLanguages(query.data.languages);
        }
    }, [query.data, setProjects, setLanguages]);

    return query;
};
