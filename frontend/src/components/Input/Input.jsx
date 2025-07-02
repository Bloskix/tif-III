import React, { forwardRef } from 'react';
import styles from './Input.module.css';

const Input = forwardRef(({ 
    label, 
    error,
    as = 'input',
    type = 'text',
    children,
    className,
    ...props 
}, ref) => {
    const Component = as;
    
    return (
        <div className={styles.inputContainer}>
            {label && (
                <label className={styles.label}>
                    {label}
                </label>
            )}
            <Component
                ref={ref}
                type={as === 'input' ? type : undefined}
                className={`${styles.input} ${error ? styles.error : ''} ${className || ''}`}
                {...props}
            >
                {children}
            </Component>
            {error && (
                <span className={styles.errorMessage}>
                    {error.message}
                </span>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input; 