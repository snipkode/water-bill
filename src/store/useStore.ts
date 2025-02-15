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
