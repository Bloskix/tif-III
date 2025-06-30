import { useState } from 'react';
import styles from './SettingsPage.module.css';
import Navbar from '../../components/Navbar/Navbar';
import SettingsSidebar from '../../components/SettingsSidebar/SettingsSidebar';
import NotificationsPanel from '../../components/NotificationsPanel/NotificationsPanel';
import UsersPanel from '../../components/UsersPanel/UsersPanel';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('notificaciones');

    return (
        <div className={styles.root}>
            <Navbar />
            <div className={styles.container}>
                {/* Título principal */}
                <h1 className={styles.title}>Configuraciones</h1>

                <div className={styles.content}>
                    <SettingsSidebar 
                        activeTab={activeTab} 
                        onTabChange={setActiveTab} 
                    />

                    {/* Panel principal */}
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