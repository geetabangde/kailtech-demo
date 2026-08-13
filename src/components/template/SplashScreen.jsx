// Local Imports
import { Link } from "react-router-dom";
import appLogo from "assets/logo.png"; 
// ----------------------------------------------------------------------

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center h-screen w-full bg-white dark:bg-dark-900">
      <style>
        {`
          @keyframes splash-slide {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
      <Link to="/" className="flex justify-center">
        <img
          src={appLogo}
          alt="App Logo"
          className="h-10 w-auto object-contain"
        />
      </Link>
      <div className="mt-4 h-1 w-64 overflow-hidden rounded-full bg-blue-100/50 dark:bg-dark-500">
        <div 
          className="h-full w-full bg-blue-600 rounded-full" 
          style={{ animation: "splash-slide 1.2s ease-in-out infinite" }}
        />
      </div>
    </div>
  );
}
