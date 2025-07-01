import styles from './Button.module.css';

const Button = ({ 
    children, 
    variant = 'primary', 
    loading = false,
    fullWidth = false,
    ...props 
}) => (
    <button
        className={`
            ${styles.button}
            ${styles[variant]}
            ${fullWidth ? styles.fullWidth : ''}
            ${loading ? styles.loading : ''}
        `}
        disabled={loading || props.disabled}
        {...props}
    >
        {loading ? (
            <div className={styles.spinner} />
        ) : (
            children
        )}
    </button>
);

export default Button; 