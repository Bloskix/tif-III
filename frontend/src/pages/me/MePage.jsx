import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserCircleIcon } from '@heroicons/react/24/outline';

import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Navbar from '../../components/Navbar/Navbar';
import userService from '../../services/userService';
import styles from './MePage.module.css';

const schema = yup.object().shape({
    email: yup
        .string()
        .email('Ingrese un email válido')
        .required('El email es requerido'),
    username: yup
        .string()
        .required('El nombre de usuario es requerido')
        .min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
});

const MePage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userData, setUserData] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const result = await userService.getCurrentUser();
                if (result.success) {
                    setUserData(result.data);
                    reset(result.data);
                } else {
                    setError('Error al cargar los datos del usuario');
                }
            } catch (err) {
                setError('Error al cargar los datos del usuario');
            }
        };

        loadUserData();
    }, [reset]);

    const onSubmit = async (data) => {
        try {
            setError('');
            setSuccess('');
            setLoading(true);
            
            const result = await userService.updateCurrentUser(data);
            if (result.success) {
                setSuccess('Perfil actualizado exitosamente');
                setUserData(result.data);
                reset(result.data);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Ocurrió un error al actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
    };

    const getRoleLabel = (role) => {
        const roles = {
            admin: 'Administrador',
            operator: 'Operador'
        };
        return roles[role] || role;
    };

    return (
        <div className={styles.root}>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.avatarSection}>
                        <UserCircleIcon className={styles.avatar} />
                    </div>

                    <h1 className={styles.title}>Mi Perfil</h1>

                    {userData && (
                        <div className={styles.infoSection}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Estado:</span>
                                <span className={`${styles.statusBadge} ${userData.is_active ? styles.active : styles.inactive}`}>
                                    {userData.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Rol:</span>
                                <span className={styles.infoValue}>{getRoleLabel(userData.role)}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Miembro desde:</span>
                                <span className={styles.infoValue}>{formatDate(userData.created_at)}</span>
                            </div>
                        </div>
                    )}

                    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                        {error && (
                            <div className={styles.error}>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className={styles.success}>
                                {success}
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Correo electrónico</label>
                            <Input
                                type="email"
                                {...register('email')}
                                error={errors.email}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Nombre de usuario</label>
                            <Input
                                {...register('username')}
                                error={errors.username}
                            />
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            loading={loading}
                        >
                            Guardar Cambios
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MePage; 