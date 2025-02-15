import { useState, useEffect } from 'react';
import { UserIcon, EditIcon, SaveIcon, XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

const Profile = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    address: '',
    phoneNumber: '',
    customerId: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setLoading(true);
      const userId = localStorage.getItem('user_id');

      const { data: customerData, error: customerError } = await supabase
        .from('pelanggan')
        .select('nama_lengkap, alamat, nomor_telepon, id, email')
        .eq('user_id', userId)
        .single();

      if (customerError) {
        console.error('Error fetching profile:', customerError);
      } else if (isMounted) {
        setProfile({
          fullName: customerData.nama_lengkap,
          email: customerData.email,
          address: customerData.alamat,
          phoneNumber: customerData.nomor_telepon,
          customerId: customerData.id
        });
      }
      setLoading(false);
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    setLoading(true);
    const userId = localStorage.getItem('user_id');

    const { error: updateError } = await supabase
      .from('pelanggan')
      .update({
        nama_lengkap: profile.fullName,
        alamat: profile.address,
        nomor_telepon: profile.phoneNumber
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
    } else {
      setIsEditing(false);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold">{t('profile.title')}</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <UserIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{profile.fullName}</h2>
            <p className="text-gray-500">{t('profile.customerId')}: {profile.customerId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('profile.fullName')}</label>
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 outline outline-1 outline-gray-300"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('profile.email')}</label>
            <input
              type="email"
              value={profile.email}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 outline outline-1 outline-gray-300"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('profile.address')}</label>
            <textarea
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 outline outline-1 outline-gray-300"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('profile.phoneNumber')}</label>
            <input
              type="tel"
              value={profile.phoneNumber}
              onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 outline outline-1 outline-gray-300"
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="mt-6 flex space-x-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-1"
                disabled={loading}
              >
                <SaveIcon className="h-5 w-5" />
                <span className="hidden sm:inline">{t('profile.saveProfile')}</span>
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center space-x-1"
              >
                <XIcon className="h-5 w-5" />
                <span className="hidden sm:inline">{t('profile.cancel')}</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-1"
            >
              <EditIcon className="h-5 w-5" />
              <span className="hidden sm:inline">{t('profile.editProfile')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;