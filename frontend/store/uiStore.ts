// store/uiStore.ts
import { create } from 'zustand';

// We can have seperate stores to store and update different values like seperate for Auth, Project, 
// interaction operations.

interface TranslationKey {
  id: string;
  key: string;
  category: string;
  description?: string;
  translations: {
    [languageCode: string]: {
      value: string;
      updatedAt: string;
      updatedBy: string;
    };
  };
}

interface UIState {
  projectSearch: string;
  setProjectSearch: (search: string) => void;

  selectedProject: string;
  setSelectedProject: (project: string) => void;

  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;

  availableProjects: { id: string; project_name: string }[];
  setAvailableProjects: (projects: { id: string; project_name: string }[]) => void;

  availableLanguages: { id: string; value: string }[];
  setAvailableLanguages: (langs: { id: string; value: string }[]) => void;

  translationData: TranslationKey[];
  setTranslationData: (data: TranslationKey[]) => void;

  token: string | null
  setToken: (token: string | null) => void

   userEmail: string | null
   setUserEmail: (email: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  projectSearch: '',
  setProjectSearch: (search) => set({ projectSearch: search }),

  selectedProject: '',
  setSelectedProject: (project) => set({ selectedProject: project }),

  selectedLanguage: '',
  setSelectedLanguage: (lang) => set({ selectedLanguage: lang }),

  availableProjects: [],
  setAvailableProjects: (projects) => set({ availableProjects: projects }),

  availableLanguages: [],
  setAvailableLanguages: (langs) => set({ availableLanguages: langs }),

  translationData: [],
  setTranslationData: (data) => set({ translationData: data }),

  token: null,
  setToken: (token) => set({ token }),

  userEmail: null,
  setUserEmail: (email) => set({ userEmail: email })
}));
