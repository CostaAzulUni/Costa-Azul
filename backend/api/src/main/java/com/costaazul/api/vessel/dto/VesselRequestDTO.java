package com.costaazul.api.vessel.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record VesselRequestDTO(
        UUID idCompany,

        // Seção 1 - Informações Básicas
        @NotBlank(message = "O nome oficial da embarcação é obrigatório.")
        @Size(max = 150, message = "O nome da embarcação deve ter no máximo 150 caracteres.")
        String vesselName,

        @NotBlank(message = "O número do registro nacional é obrigatório.")
        @Size(max = 150, message = "O número do registro nacional deve ter no máximo 150 caracteres.")
        String nationalRegistrationNumber,

        @NotBlank(message = "A bandeira é obrigatória.")
        @Size(max = 150, message = "A bandeira deve ter no máximo 150 caracteres.")
        String flag,

        @NotBlank(message = "O número IMO é obrigatório.")
        @Pattern(regexp = "^\\d{7}$", message = "O número IMO deve conter exatamente 7 dígitos numéricos.")
        String imoNumber,

        @Size(max = 500, message = "A URL da foto deve ter no máximo 500 caracteres.")
        String photoUrl,

        @NotNull(message = "O ano de fabricação é obrigatório.")
        @Min(value = 1900, message = "O ano de fabricação deve ser no mínimo 1900.")
        @Max(value = 2100, message = "O ano de fabricação deve ser no máximo 2100.")
        Short yearBuilt,

        // Seção 2 - Especificações Técnicas e Dimensões
        @NotBlank(message = "O estaleiro construtor é obrigatório.")
        @Size(max = 150, message = "O estaleiro construtor deve ter no máximo 150 caracteres.")
        String shipyard,

        @NotNull(message = "A arqueação bruta (GT) é obrigatória.")
        @Positive(message = "A arqueação bruta deve ser maior que zero.")
        BigDecimal grossTonnage,

        @Positive(message = "O porte bruto (DWT) deve ser maior que zero.")
        BigDecimal deadweightTonnage,

        @NotNull(message = "O comprimento total (LOA) é obrigatório.")
        @Positive(message = "O comprimento total deve ser maior que zero.")
        BigDecimal lengthOverall,

        @Positive(message = "A boca máxima deve ser maior que zero.")
        BigDecimal maxBeam,

        @Positive(message = "O calado operacional deve ser maior que zero.")
        BigDecimal operatingDraft,

        @Positive(message = "A velocidade máxima de serviço deve ser maior que zero.")
        BigDecimal maxServiceSpeed,

        @Size(max = 150, message = "A propulsão principal deve ter no máximo 150 caracteres.")
        String mainPropulsion,

        // Seção 3 - Capacidade & Acomodação
        @NotNull(message = "A capacidade máxima de passageiros é obrigatória.")
        @Positive(message = "A capacidade máxima de passageiros deve ser maior que zero.")
        Integer maxPassengerCapacity,

        @PositiveOrZero(message = "A capacidade máxima de tripulação não pode ser negativa.")
        Integer maxCrewCapacity,

        @PositiveOrZero(message = "A capacidade dos botes salva-vidas não pode ser negativa.")
        Integer lifeboatTotalCapacity,

        // Seção 4 - Certificações e Conformidade
        @Size(max = 150, message = "A classificadora naval deve ter no máximo 150 caracteres.")
        String classificationSociety,

        @Size(max = 150, message = "A certificação ISM deve ter no máximo 150 caracteres.")
        String ismCertification,

        LocalDate certificateExpiryDate,

        @NotBlank(message = "O status operacional é obrigatório.")
        @Pattern(
                regexp = "^(ACTIVE|INACTIVE|MAINTENANCE|DRY_DOCK)$",
                message = "O status operacional deve ser ACTIVE, INACTIVE, MAINTENANCE ou DRY_DOCK."
        )
        String operationalStatus,

        // Seção 5 - Base Operacional & Gestão
        UUID idHomePort,

        @Size(max = 150, message = "O terminal principal deve ter no máximo 150 caracteres.")
        String mainTerminal,

        UUID idManager,

        @Email(message = "O e-mail operacional informado é inválido.")
        @Size(max = 255, message = "O e-mail operacional deve ter no máximo 255 caracteres.")
        String operationalEmail,

        // Documentação Técnica
        @Valid
        List<DocumentDTO> documents
) {
    public record DocumentDTO(
            @Size(max = 50, message = "O tipo de documento deve ter no máximo 50 caracteres.")
            String documentType,

            @NotBlank(message = "O nome do arquivo de documento é obrigatório.")
            @Size(max = 255, message = "O nome do arquivo deve ter no máximo 255 caracteres.")
            String fileName,

            @NotBlank(message = "A URL do documento é obrigatória.")
            @Size(max = 500, message = "A URL do documento deve ter no máximo 500 caracteres.")
            String fileUrl,

            @Size(max = 150, message = "O MIME type deve ter no máximo 150 caracteres.")
            String mimeType,

            @PositiveOrZero(message = "O tamanho do arquivo não pode ser negativo.")
            Long fileSizeBytes
    ) {}
}