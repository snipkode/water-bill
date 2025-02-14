import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CameraIcon, Loader2Icon, PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Lightbox from '../components/Lightbox';
import { supabase } from '../lib/supabase';

const Readings = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [meterImage, setMeterImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [currentReading, setCurrentReading] = useState('');
  const [readings, setReadings] = useState<any[]>([]);

  useEffect(() => {
    const fetchReadings = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      const { data: meteranData, error: meteranError } = await supabase
        .from('meteran')
        .select('id')
        .eq('pelanggan_id', user?.id)
        .single();

      if (meteranError || !meteranData) {
        console.error('Error fetching meteran:', meteranError);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('pembacaan')
        .select('*')
        .eq('meteran_id', meteranData.id)
        .order('tanggal_pembacaan', { ascending: false });

      if (error) {
        console.error('Error fetching readings:', error);
      } else {
        setReadings(data);
      }
      setLoading(false);
    };

    fetchReadings();
  }, []);

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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: meteranData } = await supabase
        .from('meteran')
        .select('id')
        .eq('pelanggan_id', user?.id)
        .single();

      if (meterImage && meteranData) {
        const { data: imageData, error: imageError } = await supabase.storage
          .from('meter-images')
          .upload(`public/${Date.now()}_${meterImage.name}`, meterImage);

        if (imageError) throw imageError;

        const { error: insertError } = await supabase
          .from('pembacaan')
          .insert({
            meteran_id: meteranData.id,
            tanggal_pembacaan: new Date().toISOString(),
            pembacaan_saat_ini: parseFloat(currentReading),
            penggunaan: parseFloat(currentReading) - (readings[0]?.pembacaan_saat_ini || 0),
            image_url: imageData?.path,
          });

        if (insertError) throw insertError;

        setCurrentReading('');
        setMeterImage(null);
        setPreviewUrl('');
        setReadings([{ meteran_id: meteranData.id, tanggal_pembacaan: new Date().toISOString(), pembacaan_saat_ini: parseFloat(currentReading), penggunaan: parseFloat(currentReading) - (readings[0]?.pembacaan_saat_ini || 0), image_url: imageData?.path }, ...readings]);
      }
    } catch (error) {
      console.error('Error submitting reading:', error);
    } finally {
      setLoading(false);
    }
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
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    {t('readings.loading')}
                  </td>
                </tr>
              ) : readings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    {t('readings.notFound')}
                  </td>
                </tr>
              ) : (
                readings.map((reading) => (
                  <tr key={reading.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(reading.tanggal_pembacaan), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {reading.pembacaan_saat_ini.toLocaleString()} m³
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {reading.penggunaan} m³
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Lightbox imageUrl={reading.image_url} altText="Meter reading" />
                    </td>
                  </tr>
                ))
              )}
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