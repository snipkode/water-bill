import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DropletIcon, AlertCircleIcon, EyeIcon, XIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { Line, Bar } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import 'chart.js/auto';

interface Bill {
  id: string;
  jumlah: number;
  tanggal_jatuh_tempo: string;
}

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentUsage, setCurrentUsage] = useState(0);
  const [latestBill, setLatestBill] = useState<Bill | null>(null);
  const [customerId, setCustomerId] = useState('');
  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      console.log('Fetching dashboard data...');
      setLoading(true);

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
      } else if (isMounted) {
        setCustomerId(customerData.id);
        setLatestBill(customerData.tagihan[0]);

        const { data: usageData, error: usageError } = await supabase
          .from('pembacaan')
          .select('id, tanggal_pembacaan, penggunaan, pembacaan_saat_ini')
          .eq('meteran_id', customerData.meteran[0].id)
          .order('tanggal_pembacaan', { ascending: false });

        if (usageError) {
          console.error('Error fetching usage data:', usageError);
        } else if (isMounted) {
          setUsageHistory(usageData);
          const latestReading = usageData[0];
          setCurrentUsage(latestReading.pembacaan_saat_ini);

          // Update the meteran table with the latest pembacaan
          await supabase
            .from('meteran')
            .update({ pembacaan_terakhir: latestReading.pembacaan_saat_ini })
            .eq('id', customerData.meteran[0].id);

          // Create a new bill from the latest reading
          const newBillAmount = latestReading.penggunaan * 5000; // Example calculation
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30); // Set due date to 30 days from now

          const { error: billError } = await supabase
            .from('tagihan')
            .insert({
              pembacaan_id: latestReading.id,
              pelanggan_id: customerData.id,
              tanggal_tagihan: new Date().toISOString(),
              jumlah: newBillAmount,
              status: 'belum_dibayar',
              tanggal_jatuh_tempo: dueDate.toISOString(),
            });

          if (billError) {
            console.error('Error creating bill:', billError);
          } else {
            setLatestBill({
              id: latestReading.id,
              jumlah: newBillAmount,
              tanggal_jatuh_tempo: dueDate.toISOString(),
            });
          }
        }
      }

      setLoading(false);
    };

    if (user) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [user]); // Ensure the dependency array includes user to run only when it changes

  const chartData = useMemo(() => ({
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
  }), [usageHistory, t]);

  const billChartData = useMemo(() => ({
    labels: usageHistory.map((reading) => new Date(reading.tanggal_pembacaan).toLocaleDateString()),
    datasets: [
      {
        label: t('dashboard.billHistory'),
        data: usageHistory.map((reading) => reading.penggunaan * 5000), // Example calculation
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  }), [usageHistory, t]);

  const handleViewDetails = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handlePayBill = async () => {
    try {
      const { error: billError } = await supabase
        .from('tagihan')
        .update({ status: 'dibayar', tanggal_dibayar: new Date().toISOString() })
        .eq('id', latestBill?.id);

      if (billError) {
        console.error('Error paying bill:', billError);
      } else {
        setLatestBill((prev) => prev ? { ...prev, status: 'dibayar' } : null);
        setShowPopup(false);
      }
    } catch (error) {
      console.error('Error paying bill:', error);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
      
      {loading ? (
        <div className="text-center">{t('dashboard.loading')}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">{t('dashboard.currentUsage')}</p>
                  <p className="text-2xl font-bold">{currentUsage} m³</p>
                </div>
                <DropletIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">{t('dashboard.latestBill')}</p>
                  <p className="text-2xl font-bold">Rp {latestBill?.jumlah.toLocaleString()}</p>
                </div>
                <AlertCircleIcon className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-sm text-yellow-600 mt-2">{t('dashboard.dueIn', { days: latestBill?.tanggal_jatuh_tempo ? Math.ceil((new Date(latestBill.tanggal_jatuh_tempo).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0 })}</p>
              <button
                className="mt-2 flex items-center text-blue-500 hover:underline"
                onClick={handleViewDetails}
              >
                <EyeIcon className="h-5 w-5 mr-1" />
                {t('dashboard.viewDetails')}
              </button>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">{t('dashboard.customerId')}</p>
                  <p className="text-2xl font-bold">{customerId}</p>
                </div>
                <DropletIcon className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">{t('dashboard.usageHistory')}</h2>
              <div className="h-64">
                <Line data={chartData} />
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">{t('dashboard.billHistory')}</h2>
              <div className="h-64">
                <Bar data={billChartData} />
              </div>
            </div>
          </div>

          {showPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{t('dashboard.billDetails')}</h2>
                  <button onClick={handleClosePopup}>
                    <XIcon className="h-6 w-6 text-gray-500" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 mb-4">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('dashboard.usage')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('dashboard.rate')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('dashboard.total')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('dashboard.dueDate')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(latestBill?.jumlah ?? 0) / 5000} m³
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          Rp 5,000
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          Rp {latestBill?.jumlah.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {latestBill?.tanggal_jatuh_tempo}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button
                  className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={handlePayBill}
                >
                  {t('dashboard.payBill')}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;