
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-4 px-6 shadow-lg bg-white sticky top-0 z-40"> {/* Light background for header */}
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Icon color to orange accent */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[#F26545]">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm0-8c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1s1 .45 1 1v1c0 .55-.45 1-1 1zM8.5 12c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 .99.45.99 1zm7 0c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1z" />
          </svg>
          {/* Title text color to dark */}
          <h1 className="text-xl font-bold text-[#292F3B]">
            Ai Context Builder
          </h1>
        </div>
        {/* Add navigation or other elements if needed */}
      </div>
    </header>
  );
};

export default Header;
