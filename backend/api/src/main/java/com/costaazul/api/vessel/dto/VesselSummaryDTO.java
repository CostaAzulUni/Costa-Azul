package com.costaazul.api.vessel.dto;

import java.time.LocalDate;
import java.util.UUID;

public record VesselSummaryDTO(
        UUID idVessel,
        String vesselName,
        String companyName,
        String imoNumber,
        String photoUrl,
        String operationalStatus,
        Integer maxPassengerCapacity,
        Long deckCount,
        Integer maxCrewCapacity,
        UUID idHomePort,
        String mainTerminal,
        LocalDate certificateExpiryDate,
        String complianceStatus // Ex: "Conformidade em dia" ou "Certificado vence em X dias"
) {}