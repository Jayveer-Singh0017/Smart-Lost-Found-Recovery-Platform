package com.smartlostfound.repository;

import com.smartlostfound.entity.Claim;
import com.smartlostfound.entity.ClaimStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    Page<Claim> findByClaimantId(Long claimantId, Pageable pageable);

    Page<Claim> findByItemReportUserId(Long ownerId, Pageable pageable);

    Page<Claim> findByItemReportId(Long itemReportId, Pageable pageable);

    boolean existsByItemReportIdAndClaimantIdAndStatus(Long itemReportId, Long claimantId, ClaimStatus status);

    List<Claim> findByItemReportIdAndStatus(Long itemReportId, ClaimStatus status);

    long countByStatus(ClaimStatus status);
}
