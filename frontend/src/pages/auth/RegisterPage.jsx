import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import AuthForm from "../../components/AuthForm/AuthForm";
import useAuth from "../../hooks/useAuth";
import styles from "./RegisterPage.module.css";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Ingrese un email válido")
    .required("El email es requerido"),
  username: yup
    .string()
    .required("El nombre de usuario es requerido")
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  password: yup
    .string()
    .required("La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Las contraseñas deben coincidir")
    .required("Confirmar contraseña es requerido"),
});

const registerFields = [
  {
    name: "email",
    label: "Email",
    type: "email",
  },
  {
    name: "username",
    label: "Nombre de usuario",
    type: "text",
  },
  {
    name: "password",
    label: "Contraseña",
    type: "password",
  },
  {
    name: "confirmPassword",
    label: "Confirmar contraseña",
    type: "password",
  },
];

const RegisterPage = () => {
  const [error, setError] = useState("");
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
      setError("");
      setLoading(true);
      const { confirmPassword, ...registerData } = data;
      const result = await registerUser(registerData);
      if (result.success) {
        navigate("/login", {
          state: { message: "Registro exitoso. Por favor, inicia sesión." },
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Ocurrió un error al registrar el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <AuthForm
        fields={registerFields}
        onSubmit={onSubmit}
        errors={errors}
        loading={loading}
        error={error}
        handleSubmit={handleSubmit}
        register={register}
        buttonText="Registrarse"
      >
        <div className={styles.loginLink}>
          ¿Ya tienes una cuenta?
          <Link to="/login">Inicia sesión</Link>
        </div>
      </AuthForm>
    </div>
  );
};

export default RegisterPage;
