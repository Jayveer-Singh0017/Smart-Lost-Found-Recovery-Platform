package com.smartlostfound.repository;

import com.smartlostfound.entity.ModerationReport;
import com.smartlostfound.entity.ModerationReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ModerationReportRepository extends JpaRepository<ModerationReport, Long> {
    Page<ModerationReport> findByStatus(ModerationReportStatus status, Pageable pageable);
    long countByStatus(ModerationReportStatus status);
}
