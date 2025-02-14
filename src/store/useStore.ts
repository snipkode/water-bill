import {create} from 'zustand';
import { supabase } from '../lib/supabase';

interface StoreState {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  customerData: any;
  usageData: any[];
  billsData: any[];
  profileData: any;
  setUser: (user: any) => void;
  setLoading: (loading: boolean) => void;
  setCustomerData: (data: any) => void;
  setUsageData: (data: any[]) => void;
  setBillsData: (data: any[]) => void;
  setProfileData: (data: any) => void;
  fetchData: (userId: string) => Promise<void>;
  handleLogout: () => Promise<void>;
}

const useStore = create<StoreState>((set) => ({
  isAuthenticated: false,
  user: null,
  loading: true,
  customerData: null,
  usageData: [],
  billsData: [],
  profileData: null,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (loading) => set({ loading }),
  setCustomerData: (data) => set({ customerData: data }),
  setUsageData: (data) => set({ usageData: data }),
  setBillsData: (data) => set({ billsData: data }),
  setProfileData: (data) => set({ profileData: data }),
  fetchData: async (userId: string) => {
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
      .eq('user_id', userId)
      .single();

    if (customerError) {
      console.error('Error fetching customer data:', customerError);
    } else {
      set({ customerData });

      const { data: usageData, error: usageError } = await supabase
        .from('pembacaan')
        .select('id, tanggal_pembacaan, penggunaan, pembacaan_saat_ini')
        .eq('meteran_id', customerData.meteran[0].id)
        .order('tanggal_pembacaan', { ascending: false });

      if (usageError) {
        console.error('Error fetching usage data:', usageError);
      } else {
        set({ usageData });
      }

      const { data: billsData, error: billsError } = await supabase
        .from('tagihan')
        .select('*')
        .eq('pelanggan_id', customerData.id)
        .order('tanggal_tagihan', { ascending: false });

      if (billsError) {
        console.error('Error fetching bills:', billsError);
      } else {
        set({ billsData });
      }
    }

    const { data: profileData, error: profileError } = await supabase
      .from('pelanggan')
      .select('nama_lengkap, alamat, nomor_telepon, id, email')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile data:', profileError);
    } else {
      set({ profileData });
    }
  },
  handleLogout: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user_id');
    set({
      user: null,
      isAuthenticated: false,
      customerData: null,
      usageData: [],
      billsData: [],
      profileData: null,
    });
  },
}));

export default useStore;
