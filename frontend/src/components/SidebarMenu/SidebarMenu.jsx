import styles from './SidebarMenu.module.css';

const SettingsSidebar = ({ activeTab, onTabChange, options }) => {
    return (
        <div className={styles.sidebar}>
            {options.map((option) => (
                <button 
                    key={option.id}
                    className={`${styles.menuItem} ${activeTab === option.id ? styles.active : ''}`}
                    onClick={() => onTabChange(option.id)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};

// Definición de las props por defecto para evitar errores si no se pasan opciones
SettingsSidebar.defaultProps = {
    options: [],
    activeTab: '',
    onTabChange: () => {},
};

export default SettingsSidebar; 