package com.costaazul.api.vessel.repository;

import com.costaazul.api.vessel.domain.Vessel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VesselRepository extends JpaRepository<Vessel, UUID> {

    boolean existsByImoNumber(String imoNumber);

    boolean existsByNationalRegistrationNumber(String nationalRegistrationNumber);

    boolean existsByImoNumberAndIdVesselNot(String imoNumber, UUID idVessel);

    boolean existsByNationalRegistrationNumberAndIdVesselNot(String nationalRegistrationNumber, UUID idVessel);

    @EntityGraph(attributePaths = "company")
    Optional<Vessel> findWithCompanyByIdVessel(UUID idVessel);

    @EntityGraph(attributePaths = "company")
    @Query("""
        SELECT v FROM Vessel v
        WHERE (:nome = '' OR LOWER(v.vesselName) LIKE LOWER(CONCAT('%', :nome, '%'))
               OR LOWER(v.imoNumber) LIKE LOWER(CONCAT('%', :nome, '%')))
          AND (:porto = '' OR LOWER(COALESCE(v.mainTerminal, '')) LIKE LOWER(CONCAT('%', :porto, '%')))
          AND (:idPorto IS NULL OR v.idHomePort = :idPorto)
          AND (:conformidade = '' OR v.operationalStatus = :conformidade)
          AND (:status = '' OR v.operationalStatus = :status)
          AND (:porto = '' OR LOWER(COALESCE(v.mainTerminal, '')) LIKE LOWER(CONCAT('%', :porto, '%'))
               OR LOWER(COALESCE(CAST(v.idHomePort AS string), '')) LIKE LOWER(CONCAT('%', :porto, '%')))
          AND (
               :conformidade = ''
               OR (:conformidade = 'MISSING' AND v.certificateExpiryDate IS NULL)
               OR (:conformidade = 'EXPIRED' AND v.certificateExpiryDate IS NOT NULL AND v.certificateExpiryDate < :today)
               OR (:conformidade = 'EXPIRING_SOON' AND v.certificateExpiryDate IS NOT NULL AND v.certificateExpiryDate >= :today AND v.certificateExpiryDate <= :warningLimitDate)
               OR (:conformidade = 'VALID' AND v.certificateExpiryDate IS NOT NULL AND v.certificateExpiryDate > :warningLimitDate)
          )
    """)
    Page<Vessel> searchVessels(
            @Param("nome") String nome,
            @Param("porto") String porto,
            @Param("idPorto") UUID idPorto,
            @Param("conformidade") String conformidade,
            @Param("status") String status,
            @Param("porto") String porto,
            @Param("conformidade") String conformidade,
            @Param("today") LocalDate today,
            @Param("warningLimitDate") LocalDate warningLimitDate,
            Pageable pageable
    );

    @Query(value = "SELECT COUNT(*) FROM vessel.deck WHERE id_vessel = :idVessel", nativeQuery = true)
    long countDecksByVesselId(@Param("idVessel") UUID idVessel);

    @Query(value = """
        SELECT COUNT(*) FROM vessel.cabin cb
        JOIN vessel.deck d ON d.id_deck = cb.id_deck
        WHERE d.id_vessel = :idVessel
    """, nativeQuery = true)
    long countCabinsByVesselId(@Param("idVessel") UUID idVessel);

    @Query(value = """
        SELECT COUNT(*) FROM vessel.area a
        JOIN vessel.deck d ON d.id_deck = a.id_deck
        WHERE d.id_vessel = :idVessel
    """, nativeQuery = true)
    long countAreasByVesselId(@Param("idVessel") UUID idVessel);
}