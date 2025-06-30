import { useState, useEffect } from 'react';
import styles from './NotificationsPanel.module.css';
import Input from '../Input/Input';
import Button from '../Button/Button';
import notificationService from '../../services/notificationService';

const NotificationsPanel = () => {
    const [formData, setFormData] = useState({
        senderEmail: '',
        appPassword: '',
        senderName: '',
        alertThreshold: ''
    });

    const [recipientEmails, setRecipientEmails] = useState([]);
    const [pendingEmails, setPendingEmails] = useState([]);
    const [editingEmail, setEditingEmail] = useState(null);
    const [emailsToDelete, setEmailsToDelete] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [newEmail, setNewEmail] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saveError, setSaveError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        loadConfig();
        loadEmails();
    }, []);

    const validateEmail = (email) => {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    };

    const loadConfig = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await notificationService.getConfig();
            
            if (result.success) {
                if (result.data) {
                    setFormData({
                        senderEmail: result.data.sender_email || '',
                        appPassword: result.data.smtp_password || '',
                        senderName: result.data.sender_name || '',
                        alertThreshold: result.data.alert_threshold?.toString() || ''
                    });
                }
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error al cargar la configuración');
            console.error('Error completo:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadEmails = async () => {
        try {
            const result = await notificationService.getEmails();
            if (result.success) {
                setRecipientEmails(result.data);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error al cargar los emails');
            console.error('Error completo:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setSaveSuccess(false);
        setSaveError(null);
    };

    const handleAddEmail = () => {
        const tempId = `temp-${Date.now()}`;
        setNewEmail({
            id: tempId,
            email: '',
            description: '',
            is_active: true,
            isNew: true
        });
    };

    const handleNewEmailChange = (field, value) => {
        setNewEmail(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCancelNewEmail = () => {
        setNewEmail(null);
        setError(null);
    };

    const handleEditEmail = (email) => {
        setEditingEmail(email);
    };

    const handleEditChange = (field, value) => {
        setEditingEmail(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCancelEdit = () => {
        setEditingEmail(null);
    };

    const handleDeleteClick = (emailId) => {
        setShowDeleteConfirm(emailId);
    };

    const handleConfirmDelete = (emailId) => {
        setEmailsToDelete(prev => [...prev, emailId]);
        setShowDeleteConfirm(null);
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaveError(null);
        setSaveSuccess(false);

        try {
            // Primero guardar la configuración
            const configData = {
                sender_email: formData.senderEmail,
                smtp_password: formData.appPassword,
                sender_name: formData.senderName,
                alert_threshold: parseInt(formData.alertThreshold),
                smtp_username: formData.senderEmail,
                is_enabled: true
            };

            let configResult = await notificationService.updateConfig(configData);
            if (!configResult.success && configResult.error?.includes('no existe')) {
                configResult = await notificationService.createConfig(configData);
            }

            if (!configResult.success) {
                setSaveError(configResult.error);
                return;
            }

            // Procesar eliminaciones
            for (const emailId of emailsToDelete) {
                await notificationService.deleteEmail(emailId);
            }

            // Procesar nuevo email si existe y es válido
            if (newEmail && newEmail.email) {
                if (!validateEmail(newEmail.email)) {
                    setSaveError('El email nuevo no tiene un formato válido');
                    return;
                }
                await notificationService.addEmail({
                    email: newEmail.email.trim(),
                    description: newEmail.description?.trim() || '',
                    is_active: newEmail.is_active
                });
            }

            // Procesar email en edición si existe
            if (editingEmail) {
                if (!validateEmail(editingEmail.email)) {
                    setSaveError('El email editado no tiene un formato válido');
                    return;
                }
                await notificationService.updateEmail(editingEmail.id, {
                    email: editingEmail.email.trim(),
                    description: editingEmail.description?.trim() || '',
                    is_active: editingEmail.is_active
                });
            }

            // Recargar emails y limpiar estados
            await loadEmails();
            setNewEmail(null);
            setEditingEmail(null);
            setEmailsToDelete([]);
            setSaveSuccess(true);
            
        } catch (err) {
            console.error('Error al guardar:', err);
            setSaveError('Error al guardar los cambios: ' + (err.response?.data?.detail || err.message));
        }
    };

    if (loading) {
        return (
            <div className={styles.notificacionesPanel}>
                <h2>Notificaciones</h2>
                <div className={styles.loading}>Cargando configuración...</div>
            </div>
        );
    }

    return (
        <div className={styles.notificacionesPanel}>
            <h2>Notificaciones</h2>
            
            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label>Email de envío:</label>
                    <Input
                        type="email"
                        name="senderEmail"
                        value={formData.senderEmail}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                    />
                </div>
                <div className={styles.formGroup}>
                    <div className={styles.labelWithInfo}>
                        <label>Contraseña de aplicación:</label>
                        <div 
                            className={styles.infoIcon}
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                        >
                            <i className="fas fa-info-circle"></i>
                            {showTooltip && (
                                <div className={styles.tooltip}>
                                    Una contraseña de aplicación es una contraseña especial que permite que aplicaciones menos seguras accedan a tu cuenta de correo. Debes generarla desde la configuración de seguridad de tu cuenta de correo.
                                </div>
                            )}
                        </div>
                    </div>
                    <Input
                        type="password"
                        name="appPassword"
                        value={formData.appPassword}
                        onChange={handleInputChange}
                        placeholder="Contraseña de aplicación"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Nombre del enviador:</label>
                    <Input
                        type="text"
                        name="senderName"
                        value={formData.senderName}
                        onChange={handleInputChange}
                        placeholder="Nombre"
                    />
                </div>
                <div className={styles.formGroup}>
                    <div className={styles.labelWithInfo}>
                        <label>Nivel de alerta para envío automático:</label>
                        <div 
                            className={styles.infoIcon}
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                        >
                            <i className="fas fa-info-circle"></i>
                            {showTooltip && (
                                <div className={styles.tooltip}>
                                    Las alertas con un nivel igual o superior al especificado generarán notificaciones automáticas. El rango válido es de 0 a 15, siendo 15 el nivel más crítico.
                                </div>
                            )}
                        </div>
                    </div>
                    <Input
                        type="number"
                        name="alertThreshold"
                        value={formData.alertThreshold}
                        onChange={handleInputChange}
                        min="0"
                        max="15"
                        placeholder="Nivel de alerta (0-15)"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Email receptor:</label>
                    <div className={styles.emailGrid}>
                        {recipientEmails.map((email) => (
                            <div key={email.id} className={`${styles.emailCard} ${emailsToDelete.includes(email.id) ? styles.toDelete : ''}`}>
                                {editingEmail?.id === email.id ? (
                                    <div className={styles.emailInfo}>
                                        <Input
                                            type="email"
                                            value={editingEmail.email}
                                            onChange={(e) => handleEditChange('email', e.target.value)}
                                            placeholder="email@example.com"
                                        />
                                        <Input
                                            type="text"
                                            value={editingEmail.description || ''}
                                            onChange={(e) => handleEditChange('description', e.target.value)}
                                            placeholder="Descripción"
                                        />
                                        <div className={styles.emailStatus}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={editingEmail.is_active}
                                                    onChange={(e) => handleEditChange('is_active', e.target.checked)}
                                                />
                                                {editingEmail.is_active ? 'Activo' : 'Inactivo'}
                                            </label>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className={styles.cancelButton}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                ) : (
                                    <div className={styles.emailInfo}>
                                        <div className={styles.emailText}>{email.email}</div>
                                        <div className={styles.descriptionText}>{email.description || 'Sin descripción'}</div>
                                        <div className={styles.statusText}>
                                            {email.is_active ? 'Activo' : 'Inactivo'}
                                        </div>
                                        <div className={styles.emailActions}>
                                            <button
                                                type="button"
                                                onClick={() => handleEditEmail(email)}
                                                className={styles.editButton}
                                                title="Editar"
                                            >
                                                <i className="fas fa-pencil-alt"></i>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteClick(email.id)}
                                                className={styles.deleteButton}
                                                title="Eliminar"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                        {showDeleteConfirm === email.id && (
                                            <div className={styles.deleteConfirm}>
                                                <p>¿Estás seguro de que deseas eliminar este email?</p>
                                                <div className={styles.deleteActions}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleConfirmDelete(email.id)}
                                                        className={styles.confirmButton}
                                                    >
                                                        Confirmar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleCancelDelete}
                                                        className={styles.cancelButton}
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {newEmail && (
                            <div className={styles.emailCard}>
                                <div className={styles.emailInfo}>
                                    <Input
                                        type="email"
                                        value={newEmail.email}
                                        onChange={(e) => handleNewEmailChange('email', e.target.value)}
                                        placeholder="email@example.com"
                                        autoFocus
                                    />
                                    <Input
                                        type="text"
                                        value={newEmail.description}
                                        onChange={(e) => handleNewEmailChange('description', e.target.value)}
                                        placeholder="Descripción"
                                    />
                                    <div className={styles.emailStatus}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={newEmail.is_active}
                                                onChange={(e) => handleNewEmailChange('is_active', e.target.checked)}
                                            />
                                            {newEmail.is_active ? 'Activo' : 'Inactivo'}
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCancelNewEmail}
                                        className={styles.cancelButton}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}

                        {!newEmail && (
                            <div className={styles.emailCard} onClick={handleAddEmail}>
                                <div className={styles.addEmailPlaceholder}>
                                    <span>+</span>
                                    <p>Agregar email</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {saveError && (
                    <div className={styles.error}>
                        {saveError}
                    </div>
                )}

                {saveSuccess && (
                    <div className={styles.success}>
                        Configuración guardada exitosamente
                    </div>
                )}

                <div className={styles.formActions}>
                    <Button type="submit">
                        Guardar cambios
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default NotificationsPanel; 