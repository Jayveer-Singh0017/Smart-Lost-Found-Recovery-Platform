package com.smartlostfound.repository;

import com.smartlostfound.entity.ItemReport;
import com.smartlostfound.entity.ItemStatus;
import com.smartlostfound.entity.ItemType;
import com.smartlostfound.entity.ModerationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ItemReportRepository extends JpaRepository<ItemReport, Long>, JpaSpecificationExecutor<ItemReport> {

    Page<ItemReport> findByUserId(Long userId, Pageable pageable);

    Page<ItemReport> findByModerationStatus(ModerationStatus moderationStatus, Pageable pageable);

    long countByType(ItemType type);

    long countByStatus(ItemStatus status);

    long countByModerationStatus(ModerationStatus moderationStatus);

    // Candidates for deterministic matching: opposite type, active/open, approved moderation, not matching self
    @Query("SELECT r FROM ItemReport r " +
           "WHERE r.type = :targetType " +
           "AND r.status = :status " +
           "AND r.moderationStatus = :moderationStatus " +
           "AND r.id != :excludedId")
    List<ItemReport> findMatchingCandidates(
            @Param("targetType") ItemType targetType,
            @Param("status") ItemStatus status,
            @Param("moderationStatus") ModerationStatus moderationStatus,
            @Param("excludedId") Long excludedId
    );

    // Recent items query for public showcase
    List<ItemReport> findTop8ByModerationStatusAndStatusOrderByCreatedAtDesc(
            ModerationStatus moderationStatus, ItemStatus status
    );
}
