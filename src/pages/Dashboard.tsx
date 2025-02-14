import React, { useEffect, useState } from 'react';
import { DropletIcon, AlertCircleIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

interface Bill {
  jumlah: number;
  tanggal_jatuh_tempo: string;
}

const Dashboard = () => {
  const { t } = useTranslation();
  const [currentUsage, setCurrentUsage] = useState(0);
  const [latestBill, setLatestBill] = useState<Bill | null>(null);
  const [meterNumber, setMeterNumber] = useState('');
  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      const { data: meterData, error: meterError } = await supabase
        .from('meteran')
        .select('id, nomor_meteran, pembacaan_terakhir')
        .eq('pelanggan_id', user?.id)
        .single();

      const { data: billData, error: billError } = await supabase
        .from('tagihan')
        .select('*')
        .eq('pelanggan_id', user?.id)
        .order('tanggal_tagihan', { ascending: false })
        .limit(1)
        .single();

      const { data: usageData, error: usageError } = await supabase
        .from('pembacaan')
        .select('*')
        .eq('meteran_id', meterData?.id)
        .order('tanggal_pembacaan', { ascending: false });

      if (meterError || billError || usageError) {
        console.error('Error fetching data:', meterError || billError || usageError);
      } else {
        setMeterNumber(meterData.nomor_meteran);
        setCurrentUsage(meterData.pembacaan_terakhir);
        setLatestBill(billData);
        setUsageHistory(usageData);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
      
      {loading ? (
        <div className="text-center">{t('dashboard.loading')}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">{t('dashboard.currentUsage')}</p>
                  <p className="text-2xl font-bold">{currentUsage} m³</p>
                </div>
                <DropletIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">{t('dashboard.latestBill')}</p>
                  <p className="text-2xl font-bold">Rp {latestBill?.jumlah}</p>
                </div>
                <AlertCircleIcon className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-sm text-yellow-600 mt-2">{t('dashboard.dueIn', { days: latestBill?.tanggal_jatuh_tempo ? Math.ceil((new Date(latestBill.tanggal_jatuh_tempo).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0 })}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">{t('dashboard.meterNumber')}</p>
                  <p className="text-2xl font-bold">{meterNumber ? meterNumber : "PG-000-000-000"}</p>
                </div>
                <DropletIcon className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">{t('dashboard.usageHistory')}</h2>
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
              <p className="text-gray-500">{t('dashboard.usageGraph')}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;