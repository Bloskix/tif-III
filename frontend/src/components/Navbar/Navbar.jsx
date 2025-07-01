import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    HomeIcon,
    ClipboardDocumentCheckIcon,
    Cog6ToothIcon,
    UserCircleIcon,
    ArrowRightStartOnRectangleIcon
} from '@heroicons/react/24/outline';
import useAuth from '../../hooks/useAuth';
import styles from './Navbar.module.css';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAdmin, logout, user } = useAuth();
    
    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.leftSection}>
            <Link 
                to="/" 
                className={`${styles.navItem} ${isActive('/') ? styles.active : ''}`}
            >
                <HomeIcon className={styles.icon} />
                <span>Inicio</span>
            </Link>
    
            <Link 
                to="/review" 
                className={`${styles.navItem} ${isActive('/review') ? styles.active : ''}`}
            >
                <ClipboardDocumentCheckIcon className={styles.icon} />
                <span>En revisión</span>
            </Link>
    
            {isAdmin && (
                <Link 
                to="/settings" 
                className={`${styles.navItem} ${isActive('/settings') ? styles.active : ''}`}
                >
                <Cog6ToothIcon className={styles.icon} />
                <span>Configuración</span>
                </Link>
            )}
            </div>
        
            <div className={styles.rightSection}>
            <Link 
                to="/me"
                className={`${styles.navItem} ${isActive('/me') ? styles.active : ''}`}
            >
                <UserCircleIcon className={styles.icon} />
                <span>{user?.email || 'Perfil'}</span>
            </Link>
        
            <button 
                className={`${styles.navItem} ${styles.logoutButton}`}
                onClick={handleLogout}
            >
                <ArrowRightStartOnRectangleIcon className={styles.icon} />
                <span>Salir</span>
            </button>
            </div>
        </nav>
    );
};

export default Navbar; 