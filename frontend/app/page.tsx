'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUIStore } from '@/store/uiStore';

import Sidebar from '@/components/layouts/Sidebar';
import Header from '../components/layouts/Header';
import TranslationKeyManager from '@/components/translation/TranslationKeyManager';
import LoginPage from './login';

export default function Home() {
  const setProjects = useUIStore((s) => s.setAvailableProjects);
  const setLanguages = useUIStore((s) => s.setAvailableLanguages);
  const token = useUIStore((s) => s.token);
  const setToken = useUIStore((s) => s.setToken);
  const setUserEmail = useUIStore((s) => s.setUserEmail);

  // Profile fetch
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const res = await fetch('http://127.0.0.1:8000/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.status === 401) {
          setToken(null);
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setUserEmail(data?.user || '');
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();
  }, [token, setUserEmail, setToken]);

  // Localization fetch
  const query = useQuery({
    queryKey: ['initial-localizations'],
    queryFn: async () => {
      const res = await fetch('http://127.0.0.1:8000/localizations/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        setToken(null); 
        throw new Error('Unauthorized');
      }

      if (!res.ok) throw new Error('Failed to fetch localizations');
      return res.json();
    },
    staleTime: Infinity,
    retry: 1,
    enabled: !!token,
  });

  
  useEffect(() => {
    if (query.data) {
      setProjects(query.data.projects);
      setLanguages(query.data.languages);
    }
  }, [query.data, setProjects, setLanguages]);

  // Fallback to login page
  if (!token) {
    return <LoginPage />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-stone-800 dark:text-stone-200 font-[family-name:var(--font-geist-sans)]">
      <Header />
      <div className="flex flex-grow px-0 md:px-0 py-0">
        <div className="w-full md:w-1/4 xl:w-1/5">
          <Sidebar />
        </div>
        <main className="w-full md:w-3/4 xl:w-4/5 px-4 sm:px-6 lg:px-8 space-y-6">
          <TranslationKeyManager />
        </main>
      </div>
      <footer className="bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-stone-500 dark:text-stone-400">
          <p>&copy; {new Date().getFullYear()} Helium Contractor Assignment. Good luck!</p>
          <div className="mt-1">
            <a href="#" className="hover:underline mx-2">Documentation (Placeholder)</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
