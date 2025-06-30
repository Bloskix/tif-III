import React, { useState, useEffect } from 'react';
import styles from './AlertNoteModal.module.css';
import { reviewService } from '../../services/reviewService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AlertNoteModal = ({ alertId, onClose, notes, loadingNotes, notesError }) => {
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editingContent, setEditingContent] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        try {
            setLoading(true);
            await reviewService.addAlertNote(alertId, { content: newNote });
            setNewNote('');
            // Notificar al padre para recargar las notas
            if (onClose) {
                onClose(true);
            }
        } catch (err) {
            setError('Error al agregar la nota: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (note) => {
        setEditingNoteId(note.id);
        setEditingContent(note.content);
    };

    const handleEditSubmit = async (noteId) => {
        if (!editingContent.trim()) return;

        try {
            setLoading(true);
            await reviewService.updateAlertNote(alertId, noteId, { content: editingContent });
            setEditingNoteId(null);
            setEditingContent('');
            // Recargar las notas
            if (onClose) {
                onClose(true);
            }
        } catch (err) {
            setError('Error al actualizar la nota: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Notas de la Alerta</h2>
                    <button onClick={() => onClose()} className={styles.closeButton}>×</button>
                </div>
    
                {(error || notesError) && (
                    <div className={styles.error}>{error || notesError}</div>
                )}
    
                <div className={styles.notesList}>
                    {loadingNotes ? (
                        <p>Cargando notas...</p>
                    ) : notes && notes.length > 0 ? (
                        notes.map(note => (
                            <div key={note.id} className={styles.noteItem}>
                                <div className={styles.noteHeader}>
                                    <div className={styles.noteInfo}>
                                        <span className={styles.noteAuthor}>{note.author.name}</span>
                                        <span className={styles.noteDate}>{formatDate(note.created_at)}</span>
                                    </div>
                                    <button 
                                        className={styles.editButton}
                                        onClick={() => handleEditClick(note)}
                                        title="Editar nota"
                                    >
                                        <i className="fas fa-pencil-alt"></i>
                                    </button>
                                </div>
                                {editingNoteId === note.id ? (
                                    <div className={styles.editForm}>
                                        <textarea
                                            value={editingContent}
                                            onChange={(e) => setEditingContent(e.target.value)}
                                            className={styles.noteInput}
                                        />
                                        <div className={styles.editActions}>
                                            <button 
                                                onClick={() => handleEditSubmit(note.id)}
                                                className={styles.submitButton}
                                                disabled={loading || !editingContent.trim()}
                                            >
                                                Guardar
                                            </button>
                                            <button 
                                                onClick={() => setEditingNoteId(null)}
                                                className={styles.cancelButton}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className={styles.noteContent}>{note.content}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className={styles.noNotes}>No hay notas para esta alerta</p>
                    )}
                </div>
            
                <form onSubmit={handleSubmit} className={styles.noteForm}>
                    <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Escribe una nueva nota..."
                        className={styles.noteInput}
                        disabled={loading}
                    />
                    <button 
                        type="submit" 
                        className={styles.submitButton}
                        disabled={loading || !newNote.trim()}
                    >
                        Agregar Nota
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AlertNoteModal; 