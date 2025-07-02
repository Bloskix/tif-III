import React from 'react';
import PropTypes from 'prop-types';
import styles from './ErrorMessage.module.css';

const ErrorMessage = ({ message }) => {
    if (!message) return null;
    
    return (
        <div className={styles.error}>
            {message}
        </div>
    );
};

ErrorMessage.propTypes = {
    message: PropTypes.string
};

export default ErrorMessage; 