
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-4 px-6 text-center text-sm text-slate-600 border-t border-slate-200"> {/* Light theme footer */}
      <p>&copy; {new Date().getFullYear()} Ai Context Builder. Powered by Gemini.</p>
    </footer>
  );
};

export default Footer;
