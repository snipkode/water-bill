import React, { useState } from 'react';
import { format } from 'date-fns';
import { CameraIcon, Loader2Icon, PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Lightbox from '../components/Lightbox';

const Readings = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [meterImage, setMeterImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [currentReading, setCurrentReading] = useState('');

  const readings = [
    {
      id: 1,
      date: new Date(),
      reading: 150,
      usage: 15,
      imageUrl: 'https://images.unsplash.com/photo-1585245332774-3dd2b177e7fa?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 2,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      reading: 135,
      usage: 12,
      imageUrl: 'https://images.unsplash.com/photo-1586936893354-362ad6ae47ba?auto=format&fit=crop&q=80&w=400',
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMeterImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Handle reading submission here
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">{t('readings.title')}</h1>
        <button
          onClick={() => document.getElementById('reading-form')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-1"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="hidden sm:inline">{t('readings.submitNewReading')}</span>
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('readings.readingDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('readings.meterReading')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('readings.usage')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('readings.meterPhoto')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {readings.map((reading) => (
                <tr key={reading.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(reading.date, 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reading.reading.toLocaleString()} m³
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reading.usage} m³
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Lightbox imageUrl={reading.imageUrl} altText="Meter reading" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div id="reading-form" className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">{t('readings.submitNewReading')}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('readings.currentMeterReading')}
            </label>
            <input
              type="number"
              value={currentReading}
              onChange={(e) => setCurrentReading(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('readings.uploadMeterPhoto')}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="meter-photo"
                required
              />
              <label
                htmlFor="meter-photo"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Meter reading" className="max-h-48 object-contain" />
                ) : (
                  <div className="text-center">
                    <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-blue-600">{t('readings.clickToTakePhoto')}</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !meterImage || !currentReading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <Loader2Icon className="h-5 w-5 animate-spin" />
            ) : (
              t('readings.submitReading')
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Readings;