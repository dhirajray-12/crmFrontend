import React from 'react';
import DepositModal from '@/pages/ClientPage/DashboardComponents/DepositModal';
import { useAccountsStore } from '@/Store/accountsStore';

export const DepositModalWrapper: React.FC = () => {
    const { openDepositModal, setOpenDepositModal } = useAccountsStore();

    return (
        <DepositModal
            open={openDepositModal}
            onClose={() => setOpenDepositModal(false)}
        />
    );
};