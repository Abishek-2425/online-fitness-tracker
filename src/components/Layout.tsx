import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
      <footer className="bg-white shadow-sm py-4 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Online Fitness Tracker - All rights reserved</p>
      </footer>
    </div>
  );
};

export default Layout;