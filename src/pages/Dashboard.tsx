import { useEffect, useState } from 'react';
import { DropletIcon, AlertCircleIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

interface Bill {
  jumlah: number;
  tanggal_jatuh_tempo: string;
}

const Dashboard = () => {
  const { t } = useTranslation();
  const [currentUsage, setCurrentUsage] = useState(0);
  const [latestBill, setLatestBill] = useState<Bill | null>(null);
  const [customerId, setCustomerId] = useState('');
  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      const { data: customerData, error: customerError } = await supabase
        .from('pelanggan')
        .select(`
          id, 
          tagihan (
            id, 
            jumlah, 
            tanggal_jatuh_tempo
          ), 
          meteran (
            id,
            nomor_meteran,
            tanggal_instalasi,
            pembacaan_terakhir
          )
        `)
        .eq('user_id', user?.id)
        .single();

      if (customerError) {
        console.error('Error fetching data:', customerError);
      } else {
        setCustomerId(customerData.id);
        setLatestBill(customerData.tagihan[0]);

        const { data: usageData, error: usageError } = await supabase
          .from('pembacaan')
          .select('id, tanggal_pembacaan, penggunaan, pembacaan_saat_ini')
          .eq('meteran_id', customerData.meteran[0].id)
          .order('tanggal_pembacaan', { ascending: false })
          .limit(1);

        if (usageError) {
          console.error('Error fetching usage data:', usageError);
        } else {
          setUsageHistory(usageData);
          const latestReading = usageData[0];
          setCurrentUsage(latestReading.pembacaan_saat_ini);

          // Update the meteran table with the latest pembacaan
          await supabase
            .from('meteran')
            .update({ pembacaan_terakhir: latestReading.pembacaan_saat_ini })
            .eq('id', customerData.meteran[0].id);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const chartData = {
    labels: usageHistory.map((reading) => new Date(reading.tanggal_pembacaan).toLocaleDateString()),
    datasets: [
      {
        label: t('dashboard.usageHistory'),
        data: usageHistory.map((reading) => reading.penggunaan),
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

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
                  <p className="text-gray-500">{t('dashboard.customerId')}</p>
                  <p className="text-2xl font-bold">{customerId}</p>
                </div>
                <DropletIcon className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">{t('dashboard.usageHistory')}</h2>
            <div className="h-64">
              <Line data={chartData} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;