import React, { useState, useEffect } from 'react';
import styles from './AlertsTab.module.css';
import { alertService } from '../../services/alertService';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import AlertsFilters from '../AlertsFilters/AlertsFilters';
import AlertDetailModal from '../AlertDetailModal/AlertDetailModal';
import Button from '../Button/Button';

const AlertsTab = () => {
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
    console.log('useEffect ejecutado - Cambios en:', {
      currentPage,
      activeFilters
    });
    loadAlerts();
  }, [currentPage, activeFilters]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      console.log('Realizando petición con parámetros:', {
        page: currentPage,
        size: PAGE_SIZE,
        ...activeFilters
      });

      const response = await alertService.getAlerts({
        page: currentPage,
        size: PAGE_SIZE,
        ...activeFilters
      });

      console.log('Respuesta del servidor:', {
        total: response.total,
        alertCount: response.alerts.length,
        firstAlert: response.alerts[0],
        params: response.params // por si el backend devuelve los parámetros usados
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
      const formatted = format(date, 'dd/MM/yyyy HH:mm:ss', { locale: es });
      return formatted;
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const handleApplyFilters = (filters) => {
    console.log('Aplicando nuevos filtros:', filters);
    setCurrentPage(1); // Resetear a la primera página
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
      const alertDetails = await alertService.getAlertDetails(alertId);
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

  const handleAlertStatusChange = async (alertId, newStatus) => {
    // Actualizar el estado local de la alerta
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: newStatus }
          : alert
      )
    );
  };

  if (loading) {
    return <div className={styles.loading}>Cargando alertas...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button 
          onClick={() => setShowFilters(!showFilters)}
          variant="secondary"
        >
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </Button>
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
                <td>{alert.agent.name}</td>
                <td>{alert.agent.id}</td>
                <td>{alert.rule.description}</td>
                <td>{alert.rule.level}</td>
                <td>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewAlert(alert.id)}
                    title="Ver detalles"
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
          onAlertStatusChange={handleAlertStatusChange}
          isReviewTab={false}
        />
      )}
    </div>
  );
};

export default AlertsTab; 