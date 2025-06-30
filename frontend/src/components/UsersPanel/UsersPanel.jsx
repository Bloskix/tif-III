import { useState, useEffect } from 'react';
import styles from './UsersPanel.module.css';
import userService from '../../services/userService';
import Button from '../Button/Button';

const UsersPanel = () => {
    const [users, setUsers] = useState({
        admins: [],
        regularUsers: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await userService.getUsers();
            
            if (result.success) {
                // Separar usuarios por rol
                const admins = result.data.users.filter(user => user.role === 'admin');
                const regularUsers = result.data.users.filter(user => user.role === 'operator');
                
                setUsers({ admins, regularUsers });
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error al cargar los usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
    };

    const handleDeleteClick = (userId) => {
        setShowDeleteConfirm(userId);
    };

    const handleConfirmDelete = async (userId) => {
        try {
            const result = await userService.deleteUser(userId);
            if (result.success) {
                await loadUsers();
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error al eliminar el usuario');
        } finally {
            setShowDeleteConfirm(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(null);
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const result = await userService.updateUserRole(userId, newRole);
            if (result.success) {
                await loadUsers();
                setEditingUser(null);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error al cambiar el rol del usuario');
        }
    };

    if (loading) {
        return (
            <div className={styles.usuariosPanel}>
                <h2>Usuarios</h2>
                <div className={styles.loading}>Cargando usuarios...</div>
            </div>
        );
    }

    return (
        <div className={styles.usuariosPanel}>

            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}

            <div className={styles.userLists}>
                <div className={styles.adminList}>
                    <h3>Administradores:</h3>
                    <div className={styles.userGrid}>
                        {users.admins.map(admin => (
                            <div key={admin.id} className={styles.userCard}>
                                <div className={styles.userInfo}>
                                    <span className={styles.username}>{admin.username}</span>
                                    <span className={styles.email}>{admin.email}</span>
                                    <div className={styles.userActions}>
                                        {editingUser?.id === admin.id ? (
                                            <>
                                                <Button
                                                    onClick={() => handleRoleChange(admin.id, 'operator')}
                                                    className={styles.roleButton}
                                                >
                                                    Cambiar a Operador
                                                </Button>
                                                <Button
                                                    onClick={handleCancelEdit}
                                                    className={styles.cancelButton}
                                                >
                                                    Cancelar
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEditClick(admin)}
                                                    className={styles.editButton}
                                                    title="Editar"
                                                >
                                                    <i className="fas fa-pencil-alt"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(admin.id)}
                                                    className={styles.deleteButton}
                                                    title="Eliminar"
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    {showDeleteConfirm === admin.id && (
                                        <div className={styles.deleteConfirm}>
                                            <p>¿Estás seguro de que deseas eliminar este usuario?</p>
                                            <div className={styles.deleteActions}>
                                                <Button
                                                    onClick={() => handleConfirmDelete(admin.id)}
                                                    className={styles.confirmButton}
                                                >
                                                    Confirmar
                                                </Button>
                                                <Button
                                                    onClick={handleCancelDelete}
                                                    className={styles.cancelButton}
                                                >
                                                    Cancelar
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.userList}>
                    <h3>Operadores:</h3>
                    <div className={styles.userGrid}>
                        {users.regularUsers.map(user => (
                            <div key={user.id} className={styles.userCard}>
                                <div className={styles.userInfo}>
                                    <span className={styles.username}>{user.username}</span>
                                    <span className={styles.email}>{user.email}</span>
                                    <div className={styles.userActions}>
                                        {editingUser?.id === user.id ? (
                                            <>
                                                <Button
                                                    onClick={() => handleRoleChange(user.id, 'admin')}
                                                    className={styles.roleButton}
                                                >
                                                    Cambiar a Admin
                                                </Button>
                                                <Button
                                                    onClick={handleCancelEdit}
                                                    className={styles.cancelButton}
                                                >
                                                    Cancelar
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEditClick(user)}
                                                    className={styles.editButton}
                                                    title="Editar"
                                                >
                                                    <i className="fas fa-pencil-alt"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(user.id)}
                                                    className={styles.deleteButton}
                                                    title="Eliminar"
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    {showDeleteConfirm === user.id && (
                                        <div className={styles.deleteConfirm}>
                                            <p>¿Estás seguro de que deseas eliminar este usuario?</p>
                                            <div className={styles.deleteActions}>
                                                <Button
                                                    onClick={() => handleConfirmDelete(user.id)}
                                                    className={styles.confirmButton}
                                                >
                                                    Confirmar
                                                </Button>
                                                <Button
                                                    onClick={handleCancelDelete}
                                                    className={styles.cancelButton}
                                                >
                                                    Cancelar
                                                </Button>
                                            </div>
                                        </div>
                                    )}
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