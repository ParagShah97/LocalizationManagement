'use client';

import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userEmail = useUIStore((state) => state.userEmail);
  const isLoggedIn = !!userEmail;

  return (
    <header className="bg-[#0046db] text-white shadow-md">
      <div className="w-full px-4 py-2 flex justify-between items-end">
        {/* Helium Branding */}
        <div className="text-2xl font-extrabold leading-none ml-2">Helium</div>

        {/* User Profile */}
        <div className="relative">
          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 bg-white text-[#0046db] px-3 py-1 rounded hover:bg-gray-100"
              >
                <span>{userEmail}</span>
              </button>
              {/* {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow z-50">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  // TODO: Logout logic here
                  alert('Logged out');
                }}
              >
                Logout
              </button>
            </div>
          )} */}
            </div>
          ) : (
            <button className="bg-white text-[#0046db] px-3 py-1 rounded hover:bg-gray-100">
              Login
            </button>
          )}
        </div>
      </div>
    </header>

  );
};

export default Header;
