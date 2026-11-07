package com.costaazul.api.vessel.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record VesselResponseDTO(
        UUID idVessel,
        UUID idCompany,
        String companyName,
        String vesselName,
        String nationalRegistrationNumber,
        String flag,
        String imoNumber,
        String photoUrl,
        Short yearBuilt,
        String shipyard,
        BigDecimal grossTonnage,
        BigDecimal deadweightTonnage,
        BigDecimal lengthOverall,
        BigDecimal maxBeam,
        BigDecimal operatingDraft,
        BigDecimal maxServiceSpeed,
        String mainPropulsion,
        Integer maxPassengerCapacity,
        Integer maxCrewCapacity,
        Integer lifeboatTotalCapacity,
        String classificationSociety,
        String ismCertification,
        LocalDate certificateExpiryDate,
        String operationalStatus,
        UUID idHomePort,
        String mainTerminal,
        UUID idManager,
        String operationalEmail,
        Long deckCount,
        Long cabinCount,
        Long totalAreas,
        List<DocumentResponseDTO> documents,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public record DocumentResponseDTO(
            UUID idDocument,
            String documentType,
            String fileName,
            String fileUrl,
            String mimeType,
            Long fileSizeBytes,
            OffsetDateTime uploadedAt
    ) {}
}