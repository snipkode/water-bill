import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DropletIcon, ReceiptIcon, GaugeIcon, UserIcon, MenuIcon, XIcon } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';

const Navigation = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <nav className="bg-blue-600 text-white sticky top-0 w-full z-10 h-16">
        <div className="container mx-auto px-4 flex items-center justify-between h-full">
          <Link to="/" className="flex items-center space-x-2">
            <DropletIcon className="h-8 w-8" />
            <span className="font-bold text-xl">WaterBill</span>
          </Link>
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}
            >
              <DropletIcon className="h-4 w-4" />
              <span>{t('navigation.dashboard')}</span>
            </Link>
            
            <Link
              to="/bills"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${isActive('/bills')}`}
            >
              <ReceiptIcon className="h-4 w-4" />
              <span>{t('navigation.bills')}</span>
            </Link>
            
            <Link
              to="/readings"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${isActive('/readings')}`}
            >
              <GaugeIcon className="h-4 w-4" />
              <span>{t('navigation.readings')}</span>
            </Link>
            
            <Link
              to="/profile"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${isActive('/profile')}`}
            >
              <UserIcon className="h-4 w-4" />
              <span>{t('navigation.profile')}</span>
            </Link>
            <LanguageSelector />
          </div>
          <div className="flex items-center space-x-4 lg:hidden">
            <LanguageSelector />
            <button onClick={toggleMenu}>
              {isOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={toggleMenu}></div>

      <div className={`fixed inset-y-0 left-0 bg-blue-600 text-white w-64 z-30 transform lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4">
            <Link to="/" className="flex items-center space-x-2">
              <DropletIcon className="h-8 w-8" />
              <span className="font-bold text-xl">WaterBill</span>
            </Link>
            <button onClick={toggleMenu}>
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="px-4 py-6 space-y-4">
              <Link
                to="/"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}
                onClick={toggleMenu}
              >
                <DropletIcon className="h-4 w-4" />
                <span>{t('navigation.dashboard')}</span>
              </Link>
              
              <Link
                to="/bills"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${isActive('/bills')}`}
                onClick={toggleMenu}
              >
                <ReceiptIcon className="h-4 w-4" />
                <span>{t('navigation.bills')}</span>
              </Link>
              
              <Link
                to="/readings"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${isActive('/readings')}`}
                onClick={toggleMenu}
              >
                <GaugeIcon className="h-4 w-4" />
                <span>{t('navigation.readings')}</span>
              </Link>
              
              <Link
                to="/profile"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${isActive('/profile')}`}
                onClick={toggleMenu}
              >
                <UserIcon className="h-4 w-4" />
                <span>{t('navigation.profile')}</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navigation;