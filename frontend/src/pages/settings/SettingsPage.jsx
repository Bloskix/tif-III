import { useState } from 'react';
import styles from './SettingsPage.module.css';
import Navbar from '../../components/Navbar/Navbar';
import SidebarMenu from '../../components/SidebarMenu/SidebarMenu';
import NotificationsPanel from '../../components/NotificationsPanel/NotificationsPanel';
import UsersPanel from '../../components/UsersPanel/UsersPanel';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('notificaciones');

    const sidebarOptions = [
        { id: 'notificaciones', label: 'Notificaciones' },
        { id: 'usuarios', label: 'Usuarios' },
    ];

    return (
        <div className={styles.root}>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.content}>
                    <SidebarMenu 
                        activeTab={activeTab} 
                        onTabChange={setActiveTab}
                        options={sidebarOptions}
                    />

                    <div className={styles.mainPanel}>
                        {activeTab === 'notificaciones' ? (
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