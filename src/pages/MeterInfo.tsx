import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Loader2Icon } from 'lucide-react';

const MeterInfo = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [meterNumber, setMeterNumber] = useState('');
  const [installationDate, setInstallationDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: pelangganData, error: pelangganError } = await supabase
        .from('pelanggan')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (pelangganError) throw pelangganError;

      const { error: insertError } = await supabase
        .from('meteran')
        .insert({
          pelanggan_id: pelangganData.id,
          nomor_meteran: meterNumber,
          tanggal_instalasi: installationDate,
        });

      if (insertError) throw insertError;

      navigate('/readings');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t('meterInfo.title')}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="meterNumber" className="block text-sm font-medium text-gray-700">
                {t('meterInfo.meterNumber')}
              </label>
              <input
                id="meterNumber"
                type="text"
                required
                value={meterNumber}
                onChange={(e) => setMeterNumber(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="installationDate" className="block text-sm font-medium text-gray-700">
                {t('meterInfo.installationDate')}
              </label>
              <input
                id="installationDate"
                type="date"
                required
                value={installationDate}
                onChange={(e) => setInstallationDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2Icon className="h-5 w-5 animate-spin" />
                ) : (
                  t('meterInfo.submit')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MeterInfo;
