import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CreditCardIcon, Loader2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

const PaymentPage = () => {
  const { t } = useTranslation();
  const { billId } = useParams();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [bill, setBill] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchBill = async () => {
      setLoading(true);

      const { data: billData, error: billError } = await supabase
        .from('tagihan')
        .select('*')
        .eq('id', billId)
        .single();

      if (billError) {
        console.error('Error fetching bill:', billError);
      } else if (isMounted) {
        setBill(billData);
      }

      setLoading(false);
    };

    fetchBill();

    return () => {
      isMounted = false;
    };
  }, [billId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofImage(file);
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

    if (proofImage) {
      const { data, error } = await supabase.storage
        .from('payment-proofs')
        .upload(`proofs/${billId}-${proofImage.name}`, proofImage);

      if (error) {
        console.error('Error uploading proof:', error);
        setLoading(false);
        return;
      }

      const proofUrl = data?.path;

      const { error: updateError } = await supabase
        .from('tagihan')
        .update({ status: 'dibayar', proof_url: proofUrl })
        .eq('id', billId);

      if (updateError) {
        console.error('Error updating bill status:', updateError);
      } else {
        alert(t('payment.success'));
      }
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">{t('payment.details')}</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">{t('payment.billNumber', { billId })}</h2>
            <p className="text-gray-500">{t('payment.dueDate', { dueDate: bill?.tanggal_jatuh_tempo })}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{t('payment.amountDue')}</p>
            <p className="text-2xl font-bold text-blue-600">Rp {bill?.jumlah.toLocaleString()}</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">{t('payment.paymentMethod')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setPaymentMethod('bank_transfer')}
              className={`p-4 border rounded-lg flex items-center space-x-3 ${
                paymentMethod === 'bank_transfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <CreditCardIcon className="h-6 w-6 text-blue-600" />
              <div className="text-left">
                <p className="font-medium">{t('payment.bankTransfer')}</p>
                <p className="text-sm text-gray-500">{t('payment.bankTransferDescription')}</p>
              </div>
            </button>
          </div>

          {paymentMethod === 'bank_transfer' && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium mb-2">{t('payment.bankDetails')}</h4>
              <p className="text-sm text-gray-600">{t('payment.bank')}</p>
              <p className="text-sm text-gray-600">{t('payment.accountNumber')}</p>
              <p className="text-sm text-gray-600">{t('payment.accountName')}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('payment.uploadProof')}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="payment-proof"
                />
                <label
                  htmlFor="payment-proof"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Payment proof" className="max-h-48 object-contain" />
                  ) : (
                    <div className="text-center">
                      <p className="text-blue-600">{t('payment.uploadProof')}</p>
                      <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !proofImage}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <Loader2Icon className="h-5 w-5 animate-spin" />
              ) : (
                t('payment.submitPayment')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;