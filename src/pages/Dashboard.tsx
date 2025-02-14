import React from 'react';
import { DropletIcon, AlertCircleIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
      <p>{t('dashboard.welcomeMessage')}</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">{t('dashboard.currentUsage')}</p>
              <p className="text-2xl font-bold">150 m³</p>
            </div>
            <DropletIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">{t('dashboard.latestBill')}</p>
              <p className="text-2xl font-bold">Rp 250.000</p>
            </div>
            <AlertCircleIcon className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-sm text-yellow-600 mt-2">{t('dashboard.dueIn', { days: 5 })}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">{t('dashboard.meterNumber')}</p>
              <p className="text-2xl font-bold">A123456789</p>
            </div>
            <DropletIcon className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{t('dashboard.usageHistory')}</h2>
        <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
          <p className="text-gray-500">{t('dashboard.usageGraphPlaceholder')}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;