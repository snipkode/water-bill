import { useState } from 'react';
import { UserIcon, EditIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState({
    fullName: 'John Doe',
    email: 'john@example.com',
    address: 'Jl. Sudirman No. 123',
    phoneNumber: '081234567890',
    meterNumber: 'A123456789'
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">{t('profile.title')}</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <UserIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{profile.fullName}</h2>
            <p className="text-gray-500">{t('profile.customerId')}: {profile.meterNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('profile.fullName')}</label>
            <input
              type="text"
              value={profile.fullName}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('profile.email')}</label>
            <input
              type="email"
              value={profile.email}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('profile.address')}</label>
            <input
              type="text"
              value={profile.address}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('profile.phoneNumber')}</label>
            <input
              type="tel"
              value={profile.phoneNumber}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled
            />
          </div>
        </div>

        <div className="mt-6">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-1">
            <EditIcon className="h-5 w-5" />
            <span className="hidden sm:inline">{t('profile.editProfile')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;