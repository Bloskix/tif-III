import Input from '../Input/Input';
import Button from '../Button/Button';
import styles from './AuthForm.module.css';

const AuthForm = ({
    fields,
    onSubmit,
    errors,
    loading,
    error,
    handleSubmit,
    register,
    buttonText,
    children
}) => {
    return (
        <div className={styles.formContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>{buttonText}</h1>
            </div>

            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                {fields.map(field => (
                    <Input
                        key={field.name}
                        label={field.label}
                        type={field.type}
                        {...register(field.name)}
                        error={errors[field.name]}
                    />
                ))}

                <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                >
                    {buttonText}
                </Button>

                {children}
            </form>
        </div>
    );
};

export default AuthForm; 