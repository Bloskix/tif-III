import React from 'react';
import styles from './SettingsPage.module.css';
import Navbar from '../../components/Navbar/Navbar';
import SidebarMenu from '../../components/SidebarMenu/SidebarMenu';
import NotificationsPanel from '../../components/NotificationsPanel/NotificationsPanel';
import UsersPanel from '../../components/UsersPanel/UsersPanel';
import { useTabs } from '../../hooks/useTabs';

const SETTINGS_TABS = [
    { id: 'notificaciones', label: 'Notificaciones' },
    { id: 'usuarios', label: 'Usuarios' },
];

const SettingsPage = () => {
    const { activeTab, setActiveTab, isTab, tabs } = useTabs(SETTINGS_TABS, 'notificaciones');

    return (
        <div className={styles.root}>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.content}>
                    <SidebarMenu 
                        activeTab={activeTab} 
                        onTabChange={setActiveTab}
                        options={tabs}
                    />

                    <div className={styles.mainPanel}>
                        {isTab('notificaciones') ? (
                            <NotificationsPanel />
                        ) : (
                            <UsersPanel />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage; 