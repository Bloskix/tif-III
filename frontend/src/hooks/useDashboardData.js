import { useState, useEffect, useRef } from 'react';
import { alertService } from '../services/alertService';

const REFRESH_INTERVAL = 300000;

export function useDashboardData(period) {
    const [dashboardData, setDashboardData] = useState({
        alertsOverTime: [],
        ruleLevels: [],
        topRules: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const lastFetchTime = useRef(0);

    const fetchDashboardData = async (force = false) => {
        const now = Date.now();
        if (!force && now - lastFetchTime.current < 1000) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const data = await alertService.getDashboardStats(period);
            setDashboardData(data);
            lastFetchTime.current = now;
        } catch (err) {
            setError(err.message);
            setDashboardData({
            alertsOverTime: [],
            ruleLevels: [],
            topRules: []
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData(true);
        const intervalId = setInterval(() => {
            fetchDashboardData(false);
        }, REFRESH_INTERVAL);
        return () => {
            clearInterval(intervalId);
        };
    }, [period]);

    return {
        dashboardData,
        loading,
        error,
        refreshData: () => fetchDashboardData(true)
    };
} 