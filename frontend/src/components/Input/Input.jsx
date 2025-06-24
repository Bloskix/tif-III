import { forwardRef } from 'react';
import styles from './Input.module.css';

const Input = forwardRef(({ 
    label, 
    error, 
    type = 'text',
    ...props 
}, ref) => (
    <div className={styles.inputContainer}>
        <input
            ref={ref}
            type={type}
            className={`${styles.input} ${error ? styles.error : ''}`}
            placeholder={label}
            {...props}
        />
        {error && (
            <span className={styles.errorMessage}>
                {error.message}
            </span>
        )}
    </div>
));

export default Input; 