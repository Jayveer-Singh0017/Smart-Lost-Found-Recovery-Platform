package com.smartlostfound.service;

import com.smartlostfound.entity.AuditLog;
import com.smartlostfound.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void record(String action, String entityName, Long entityId, String performedBy, String details) {
        record(action, entityName, entityId, performedBy, details, null);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void record(String action, String entityName, Long entityId, String performedBy, String details, String ipAddress) {
        AuditLog log = new AuditLog(action, entityName, entityId, performedBy, details, ipAddress);
        auditLogRepository.save(log);
    }
}
