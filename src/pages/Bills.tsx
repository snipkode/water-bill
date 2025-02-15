import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CreditCardIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Bills = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [billsPerPage] = useState(10);

  useEffect(() => {
    const fetchBills = async () => {
      console.log('Fetching bills data...');
      setLoading(true);

      const { data: customerData, error: customerError } = await supabase
        .from('pelanggan')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (customerError) {
        console.error('Error fetching customer data:', customerError);
        setLoading(false);
        return;
      }

      const { data: billsData, error: billsError } = await supabase
        .from('tagihan')
        .select('*')
        .eq('pelanggan_id', customerData.id)
        .order('tanggal_tagihan', { ascending: false });

      if (billsError) {
        console.error('Error fetching bills:', billsError);
      } else {
        setBills(billsData || []);
      }

      setLoading(false);
    };

    if (user) {
      fetchBills();
    }
  }, [user]);

  const handlePayNow = (billId: number) => {
    navigate(`/payment/${billId}`);
  };

  // Get current bills
  const indexOfLastBill = currentPage * billsPerPage;
  const indexOfFirstBill = indexOfLastBill - billsPerPage;
  const currentBills = bills.slice(indexOfFirstBill, indexOfLastBill);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">{t('bills.title')}</h1>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bills.billDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bills.amount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bills.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bills.dueDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bills.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    {t('bills.loading')}
                  </td>
                </tr>
              ) : currentBills.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    {t('bills.notFound')}
                  </td>
                </tr>
              ) : (
                currentBills.map((bill) => (
                  <tr key={bill.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(bill.tanggal_tagihan), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      Rp {bill.jumlah.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {bill.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(bill.tanggal_jatuh_tempo), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                        onClick={() => handlePayNow(bill.id)}
                      >
                        <CreditCardIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">{t('bills.payNow')}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {Math.ceil(bills.length / billsPerPage) > 1 && (
        <div className="flex justify-center mt-4">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span className="sr-only">Previous</span>
              &lt;
            </button>
            {[...Array(Math.ceil(bills.length / billsPerPage)).keys()].map((number) => (
              <button
                key={number + 1}
                onClick={() => paginate(number + 1)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === number + 1
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {number + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(bills.length / billsPerPage)}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span className="sr-only">Next</span>
              &gt;
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

export default Bills;