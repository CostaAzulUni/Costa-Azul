package com.costaazul.api.vessel.repository;

import com.costaazul.api.vessel.domain.Vessel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VesselRepository extends JpaRepository<Vessel, UUID> {

    boolean existsByImoNumber(String imoNumber);

    boolean existsByNationalRegistrationNumber(String nationalRegistrationNumber);

    @EntityGraph(attributePaths = "company")
    Optional<Vessel> findWithCompanyByIdVessel(UUID idVessel);

    @EntityGraph(attributePaths = "company")
    @Query("""
        SELECT v FROM Vessel v
        WHERE (:nome = '' OR LOWER(v.vesselName) LIKE LOWER(CONCAT('%', :nome, '%'))
               OR LOWER(v.imoNumber) LIKE LOWER(CONCAT('%', :nome, '%')))
          AND (:status = '' OR v.operationalStatus = :status)
    """)
    Page<Vessel> searchVessels(
            @Param("nome") String nome,
            @Param("status") String status,
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