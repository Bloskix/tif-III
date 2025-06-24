import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { useAuth } from '../../context/AuthContext';
import styles from './RegisterPage.module.css';

const schema = yup.object().shape({
    email: yup
        .string()
        .email('Ingrese un email válido')
        .required('El email es requerido'),
    username: yup
        .string()
        .required('El nombre de usuario es requerido')
        .min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
    password: yup
        .string()
        .required('La contraseña es requerida')
        .min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir')
        .required('Confirmar contraseña es requerido'),
});

const RegisterPage = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register: registerUser } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        try {
            setError('');
            setLoading(true);
            const { confirmPassword, ...registerData } = data;
            const result = await registerUser(registerData);
            if (result.success) {
                navigate('/login', { 
                    state: { message: 'Registro exitoso. Por favor, inicia sesión.' } 
                });
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Ocurrió un error al registrar el usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Crear una cuenta</h1>
                </div>

                <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <Input
                        label="Email"
                        type="email"
                        {...register('email')}
                        error={errors.email}
                    />

                    <Input
                        label="Nombre de usuario"
                        {...register('username')}
                        error={errors.username}
                    />

                    <Input
                        label="Contraseña"
                        type="password"
                        {...register('password')}
                        error={errors.password}
                    />

                    <Input
                        label="Confirmar contraseña"
                        type="password"
                        {...register('confirmPassword')}
                        error={errors.confirmPassword}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        loading={loading}
                    >
                        Registrarse
                    </Button>

                    <div className={styles.loginLink}>
                        ¿Ya tienes una cuenta?
                        <Link to="/login">Inicia sesión</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage; 