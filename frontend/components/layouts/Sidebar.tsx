'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';

const Sidebar = () => {
  const {
    availableProjects,
    selectedProject,
    setSelectedProject,
    availableLanguages,
    selectedLanguage,
    setSelectedLanguage,
  } = useUIStore();

  useEffect(() => {
    if (!selectedProject && availableProjects.length > 0) {
      setSelectedProject(availableProjects[0].id);
    }
  }, [availableProjects, selectedProject, setSelectedProject]);


  useEffect(() => {
    if (!selectedLanguage && availableLanguages.length > 0) {
      const enLang = availableLanguages.find((lang) => lang.id === 'en');
      setSelectedLanguage(enLang ? enLang.id : availableLanguages[0].id);
    }
  }, [availableLanguages, selectedLanguage, setSelectedLanguage]);

  return (
    <aside className="sticky left-0 top-0 h-screen w-full md:w-64 bg-[#0046db] text-white p-6 space-y-10">
      {/* Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Projects</h2>
          {/* <button
            onClick={() => alert('Open project creation modal')}
            className="text-white text-xl leading-none hover:text-gray-300"
            aria-label="Add project"
          >
            +
          </button> */}
        </div>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full px-3 py-2 rounded text-black bg-white"
        >
          <option value="" disabled>Select a project</option>
          {availableProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.project_name}
            </option>
          ))}
        </select>
      </div>

      {/* Languages Section */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Languages</h2>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="w-full px-3 py-2 rounded text-black bg-white"
        >
          <option value="" disabled>Select a language</option>
          {availableLanguages.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.value}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
};

export default Sidebar;
