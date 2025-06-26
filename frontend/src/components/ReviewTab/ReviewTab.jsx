import React, { useState, useEffect } from 'react';
import styles from './ReviewTab.module.css';
import { reviewService } from '../../services/reviewService';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import AlertsFilters from '../AlertsFilters/AlertsFilters';
import AlertDetailModal from '../AlertDetailModal/AlertDetailModal';

const ReviewTab = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedAlert, setSelectedAlert] = useState(null);
  const PAGE_SIZE = 10;

  useEffect(() => {
    loadAlerts();
  }, [currentPage, activeFilters]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getManagedAlerts({
        page: currentPage,
        size: PAGE_SIZE,
        ...activeFilters
      });

      setAlerts(response.alerts);
      setTotalAlerts(response.total);
      setError(null);
    } catch (err) {
      console.error('Error en loadAlerts:', err);
      setError('Error al cargar las alertas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const handleApplyFilters = (filters) => {
    setCurrentPage(1);
    setActiveFilters(filters);
  };

  const totalPages = Math.ceil(totalAlerts / PAGE_SIZE);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleViewAlert = async (alertId) => {
    try {
      setLoading(true);
      const alertDetails = await reviewService.getManagedAlertDetails(alertId);
      setSelectedAlert(alertDetails);
    } catch (err) {
      console.error('Error al cargar los detalles de la alerta:', err);
      setError('Error al cargar los detalles de la alerta: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedAlert(null);
  };

  const handleAlertStateChange = async (alertId, newState) => {
    try {
      await reviewService.updateManagedAlertState(alertId, newState);
      // Recargar la lista de alertas
      loadAlerts();
    } catch (err) {
      console.error('Error al actualizar el estado de la alerta:', err);
      setError('Error al actualizar el estado de la alerta: ' + err.message);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Cargando alertas en revisión...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={styles.toggleFiltersButton}
        >
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>
      </div>

      {showFilters && (
        <AlertsFilters onApplyFilters={handleApplyFilters} />
      )}
      
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Nombre agente</th>
              <th>ID agente</th>
              <th>Descripción de regla</th>
              <th>Nivel</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map(alert => (
              <tr key={alert.id}>
                <td>{formatDate(alert.timestamp)}</td>
                <td>{alert.agent_name}</td>
                <td>{alert.agent_id}</td>
                <td>{alert.rule_description}</td>
                <td>{alert.rule_level}</td>
                <td>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewAlert(alert.id)}
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <button 
          onClick={handlePreviousPage} 
          disabled={currentPage === 1}
          className={styles.paginationButton}
        >
          Anterior
        </button>
        <span className={styles.pageInfo}>
          Página {currentPage} de {totalPages}
        </span>
        <button 
          onClick={handleNextPage} 
          disabled={currentPage === totalPages}
          className={styles.paginationButton}
        >
          Siguiente
        </button>
      </div>

      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          onClose={handleCloseModal}
          onAlertStateChange={handleAlertStateChange}
        />
      )}
    </div>
  );
};

export default ReviewTab; 