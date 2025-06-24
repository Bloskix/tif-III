import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { useAuth } from '../../context/AuthContext';
import styles from './LoginPage.module.css';

const schema = yup.object().shape({
    email: yup
        .string()
        .email('Ingrese un email válido')
        .required('El email es requerido'),
    password: yup
        .string()
        .required('La contraseña es requerida')
        .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const LoginPage = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

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
            const result = await login(data);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Ocurrió un error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Iniciar Sesión</h1>
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
                        label="Contraseña"
                        type="password"
                        {...register('password')}
                        error={errors.password}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        loading={loading}
                    >
                        Iniciar Sesión
                    </Button>

                    <div className={styles.signupLink}>
                        ¿No tienes una cuenta?
                        <Link to="/register">Regístrate</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage; 