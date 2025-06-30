import styles from './SettingsSidebar.module.css';

const SettingsSidebar = ({ activeTab, onTabChange }) => {
    return (
        <div className={styles.sidebar}>
            <button 
            className={`${styles.menuItem} ${activeTab === 'notificaciones' ? styles.active : ''}`}
            onClick={() => onTabChange('notificaciones')}
            >
            Notificaciones
            </button>
            <button 
            className={`${styles.menuItem} ${activeTab === 'usuarios' ? styles.active : ''}`}
            onClick={() => onTabChange('usuarios')}
            >
            Usuarios
            </button>
        </div>
    );
};

export default SettingsSidebar; 