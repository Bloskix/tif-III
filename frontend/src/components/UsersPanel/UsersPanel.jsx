import { useState, useEffect } from 'react';
import styles from './UsersPanel.module.css';

const UsersPanel = () => {
    const [users, setUsers] = useState({
        admins: [],
        regularUsers: []
    });

    useEffect(() => {
        // TODO: Cargar usuarios desde el backend
        // Por ahora usamos datos de ejemplo
        setUsers({
            admins: [
            { id: 1, email: 'admin1@example.com', username: 'Admin 1' },
            { id: 2, email: 'admin2@example.com', username: 'Admin 2' }
            ],
            regularUsers: [
            { id: 3, email: 'user1@example.com', username: 'Usuario 1' },
            { id: 4, email: 'user2@example.com', username: 'Usuario 2' },
            { id: 5, email: 'user3@example.com', username: 'Usuario 3' }
            ]
        });
    }, []);

    return (
        <div className={styles.usuariosPanel}>
            <h2>Usuarios</h2>
            <div className={styles.userLists}>
            <div className={styles.adminList}>
                <h3>Admins:</h3>
                <div className={styles.userGrid}>
                {users.admins.map(admin => (
                    <div key={admin.id} className={styles.userCard}>
                    <div className={styles.userInfo}>
                        <span className={styles.username}>{admin.username}</span>
                        <span className={styles.email}>{admin.email}</span>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            <div className={styles.userList}>
                <h3>Users:</h3>
                <div className={styles.userGrid}>
                {users.regularUsers.map(user => (
                    <div key={user.id} className={styles.userCard}>
                    <div className={styles.userInfo}>
                        <span className={styles.username}>{user.username}</span>
                        <span className={styles.email}>{user.email}</span>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            </div>
        </div>
    );
};

export default UsersPanel; 