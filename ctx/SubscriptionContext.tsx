import { supabase } from '@/lib/supabase';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

export type SubscriptionTier = 'free' | 'pro';

type SubscriptionContextType = {
    isPro: boolean;
    isLoading: boolean;
    offerings: PurchasesPackage[];
    purchasePackage: (pack: PurchasesPackage) => Promise<CustomerInfo | undefined>;
    restorePermissions: () => Promise<CustomerInfo | undefined>;
    checkQuota: (userId: string, type: 'scan' | 'ai') => Promise<boolean>;
    checkPdfQuota: (userId: string) => Promise<boolean>;
    incrementQuota: (userId: string, type: 'scan' | 'ai' | 'pdf') => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const [isPro, setIsPro] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [offerings, setOfferings] = useState<PurchasesPackage[]>([]);
    const [isConfigured, setIsConfigured] = useState(false);

    useEffect(() => {
        initPurchases();

        const customerInfoUpdated = (info: CustomerInfo) => {
            handleCustomerInfo(info);
        };

        Purchases.addCustomerInfoUpdateListener(customerInfoUpdated);

        return () => {
            Purchases.removeCustomerInfoUpdateListener(customerInfoUpdated);
        };
    }, []);

    const initPurchases = async () => {
        try {
            if (Platform.OS === 'android' || Platform.OS === 'ios') {
                if (!API_KEY) {
                    console.warn("RevenueCat API Key not found");
                    setIsLoading(false);
                    return;
                }

                if (!isConfigured) {
                    await Purchases.configure({ apiKey: API_KEY });
                    setIsConfigured(true);
                }

                const info = await Purchases.getCustomerInfo();
                handleCustomerInfo(info);
                loadOfferings();
            } else {
                setIsLoading(false);
            }
        } catch (e) {
            console.error("Error initializing purchases", e);
            setIsLoading(false);
        }
    };

    const loadOfferings = async () => {
        try {
            const offerings = await Purchases.getOfferings();
            if (offerings.current && offerings.current.availablePackages.length !== 0) {
                setOfferings(offerings.current.availablePackages);
            }
        } catch (e) {
            console.error("Error loading offerings", e);
        }
    };

    const handleCustomerInfo = async (info: CustomerInfo) => {
        // DEBUG LOGGING
        console.log("RevenueCat Customer Info:", JSON.stringify(info, null, 2));
        console.log("Active Entitlements:", info.entitlements.active);

        const hasProAccess = typeof info.entitlements.active['pro_access'] !== "undefined";
        console.log("Has Pro Access:", hasProAccess);

        setIsPro(hasProAccess);
        setIsLoading(false);

        // SYNC to Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { error } = await supabase
                .from('profiles')
                .update({ subscription_tier: hasProAccess ? 'pro' : 'free' })
                .eq('id', user.id);

            if (error) {
                console.error("Error updating profile subscription status:", error);
            } else {
                console.log("Successfully updated profile subscription status to:", hasProAccess ? 'pro' : 'free');
            }
        }
    };

    const restorePermissions = async () => {
        try {
            const info = await Purchases.restorePurchases();
            await handleCustomerInfo(info);
            return info;
        } catch (e) {
            console.error("Error restoring purchases", e);
            throw e;
        }
    };

    const purchasePackage = async (pack: PurchasesPackage) => {
        try {
            const { customerInfo } = await Purchases.purchasePackage(pack);
            await handleCustomerInfo(customerInfo);
            return customerInfo;
        } catch (e: any) {
            if (!e.userCancelled) {
                console.error("Error purchasing package", e);
                throw e;
            }
        }
    };

    // QUOTA MANAGEMENT
    const checkQuota = async (userId: string, type: 'scan' | 'ai'): Promise<boolean> => {
        if (isPro) return true;

        const { data, error } = await supabase
            .from('user_quotas')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error checking quota:', error);
            return false;
        }

        const today = new Date().toISOString().split('T')[0];

        if (!data) return true;
        if (data.last_reset_date !== today) return true;

        const limit = 1;
        if (type === 'scan') return (data.feed_scans_count || 0) < limit;
        if (type === 'ai') return (data.ai_creations_count || 0) < limit;

        return false;
    };

    const checkPdfQuota = async (userId: string): Promise<boolean> => {
        if (isPro) return true;

        const { data } = await supabase
            .from('user_quotas')
            .select('pdf_uploads_count')
            .eq('user_id', userId)
            .single();

        const count = data?.pdf_uploads_count || 0;
        return count < 10;
    };

    const incrementQuota = async (userId: string, type: 'scan' | 'ai' | 'pdf'): Promise<void> => {
        if (isPro && type !== 'pdf') return;

        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase.from('user_quotas').select('*').eq('user_id', userId).single();

        let updates: any = { user_id: userId };

        if (!data || data.last_reset_date !== today) {
            updates.last_reset_date = today;
            updates.feed_scans_count = type === 'scan' ? 1 : 0;
            updates.ai_creations_count = type === 'ai' ? 1 : 0;
            updates.pdf_uploads_count = (data?.pdf_uploads_count || 0) + (type === 'pdf' ? 1 : 0);
        } else {
            updates.feed_scans_count = (data.feed_scans_count || 0) + (type === 'scan' ? 1 : 0);
            updates.ai_creations_count = (data.ai_creations_count || 0) + (type === 'ai' ? 1 : 0);
            updates.pdf_uploads_count = (data.pdf_uploads_count || 0) + (type === 'pdf' ? 1 : 0);
        }

        const { error } = await supabase
            .from('user_quotas')
            .upsert(updates);

        if (error) console.error("Error incrementing quota", error);
    };

    return (
        <SubscriptionContext.Provider value={{
            isPro,
            isLoading,
            offerings,
            purchasePackage,
            restorePermissions,
            checkQuota,
            checkPdfQuota,
            incrementQuota
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};
