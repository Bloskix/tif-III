import { useState } from 'react';

export const TAB_OPEN = 'abiertas';
export const TAB_CLOSED = 'cerradas';

export const REVIEW_TABS = [
    { id: TAB_OPEN, label: 'Alertas en Revisión' },
    { id: TAB_CLOSED, label: 'Alertas Cerradas' },
];

export const useReviewTabs = () => {
    const [activeTab, setActiveTab] = useState(TAB_OPEN);

    const isOpenTab = activeTab === TAB_OPEN;
    const getCurrentTabState = () => isOpenTab ? "abierta" : "cerrada";
    const shouldShowNotes = isOpenTab;

    return {
        activeTab,
        setActiveTab,
        isOpenTab,
        getCurrentTabState,
        shouldShowNotes,
        tabs: REVIEW_TABS
    };
}; 