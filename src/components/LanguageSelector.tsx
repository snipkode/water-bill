import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-2 rounded-md text-sm font-medium ${i18n.language === 'en' ? 'bg-blue-700 text-white' : 'bg-white text-blue-700'}`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('id')}
        className={`px-3 py-2 rounded-md text-sm font-medium ${i18n.language === 'id' ? 'bg-blue-700 text-white' : 'bg-white text-blue-700'}`}
      >
        ID
      </button>
    </div>
  );
};

export default LanguageSelector;
