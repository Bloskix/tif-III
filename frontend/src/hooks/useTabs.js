import { useState } from 'react';

export const useTabs = (tabs, initialTabId) => {
    const [activeTab, setActiveTab] = useState(initialTabId);

    const isTab = (tabId) => activeTab === tabId;
    
    return {
        activeTab,
        setActiveTab,
        isTab,
        tabs
    };
}; 