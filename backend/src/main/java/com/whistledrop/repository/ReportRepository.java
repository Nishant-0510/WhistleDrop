package com.whistledrop.repository;

import com.whistledrop.entity.Report;
import com.whistledrop.entity.ReportCategory;
import com.whistledrop.entity.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long>, JpaSpecificationExecutor<Report> {

    Optional<Report> findByCaseCode(String caseCode);

    boolean existsByCaseCode(String caseCode);

    long countByStatus(ReportStatus status);

    long countByCategory(ReportCategory category);

    List<Report> findTop5ByOrderByCreatedAtDesc();
}
