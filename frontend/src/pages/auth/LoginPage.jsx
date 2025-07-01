import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import AuthForm from '../../components/AuthForm/AuthForm';
import useAuth from '../../hooks/useAuth';
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

const loginFields = [
    {
        name: 'email',
        label: 'Email',
        type: 'email'
    },
    {
        name: 'password',
        label: 'Contraseña',
        type: 'password'
    }
];

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
            <AuthForm
                fields={loginFields}
                onSubmit={onSubmit}
                errors={errors}
                loading={loading}
                error={error}
                handleSubmit={handleSubmit}
                register={register}
                buttonText="Iniciar Sesión"
            >
                <div className={styles.signupLink}>
                    ¿No tienes una cuenta?
                    <Link to="/register">Regístrate</Link>
                </div>
            </AuthForm>
        </div>
    );
};

export default LoginPage; 