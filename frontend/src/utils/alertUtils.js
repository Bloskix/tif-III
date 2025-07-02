export const ALERT_STATES = {
    OPEN: 'abierta',
    CLOSED: 'cerrada',
    IGNORED: 'ignored'
};

export const normalizeAlert = (alert) => {
    if (!alert) return null;

    return {
        id: alert.id,
        timestamp: alert.timestamp,
        status: alert.state || alert.status,
        agent: {
            id: alert.agent_id || (alert.agent && alert.agent.id),
            name: alert.agent_name || (alert.agent && alert.agent.name),
            ip: alert.agent_ip || (alert.agent && alert.agent.ip)
        },
        rule: {
            id: alert.rule_id || (alert.rule && alert.rule.id),
            level: alert.rule_level || (alert.rule && alert.rule.level),
            description: alert.rule_description || (alert.rule && alert.rule.description),
            groups: (alert.rule && alert.rule.groups) || []
        },
        full_log: alert.alert_data || alert.full_log,
        location: alert.location
    };
}; 