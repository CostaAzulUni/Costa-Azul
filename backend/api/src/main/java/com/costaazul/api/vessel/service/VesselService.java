package com.costaazul.api.vessel.service;

import com.costaazul.api.vessel.domain.Company;
import com.costaazul.api.vessel.domain.Vessel;
import com.costaazul.api.vessel.domain.VesselDocument;
import com.costaazul.api.vessel.dto.PagedVesselResponseDTO;
import com.costaazul.api.vessel.dto.VesselRequestDTO;
import com.costaazul.api.vessel.dto.VesselResponseDTO;
import com.costaazul.api.vessel.dto.VesselSummaryDTO;
import com.costaazul.api.vessel.repository.CompanyRepository;
import com.costaazul.api.vessel.repository.VesselDocumentRepository;
import com.costaazul.api.vessel.repository.VesselRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class VesselService {

    private final VesselRepository vesselRepository;
    private final CompanyRepository companyRepository;
    private final VesselDocumentRepository documentRepository;

    public VesselService(VesselRepository vesselRepository,
                         CompanyRepository companyRepository,
                         VesselDocumentRepository documentRepository) {
        this.vesselRepository = vesselRepository;
        this.companyRepository = companyRepository;
        this.documentRepository = documentRepository;
    }

    @Transactional
    public VesselResponseDTO createVessel(VesselRequestDTO dto) {
        if (vesselRepository.existsByImoNumber(dto.imoNumber())) {
            throw new IllegalArgumentException("Já existe uma embarcação cadastrada com este número IMO.");
        }
        if (vesselRepository.existsByNationalRegistrationNumber(dto.nationalRegistrationNumber())) {
            throw new IllegalArgumentException("Já existe uma embarcação com este Número de Registro Nacional.");
        }

        Company company = (dto.idCompany() != null)
                ? companyRepository.findById(dto.idCompany())
                .orElseThrow(() -> new IllegalArgumentException("Empresa responsável não encontrada."))
                : companyRepository.findByCompanyName("Costa Azul Cruzeiros")
                .orElseGet(() -> {
                    Company defaultCompany = new Company();
                    defaultCompany.setCompanyName("Costa Azul Cruzeiros");
                    defaultCompany.setTaxId("00.000.000/0001-00");
                    return companyRepository.save(defaultCompany);
                });

        Vessel vessel = new Vessel();
        vessel.setCompany(company);
        vessel.setVesselName(dto.vesselName());
        vessel.setNationalRegistrationNumber(dto.nationalRegistrationNumber());
        vessel.setFlag(dto.flag());
        vessel.setImoNumber(dto.imoNumber());
        vessel.setPhotoUrl(dto.photoUrl());
        vessel.setYearBuilt(dto.yearBuilt());
        vessel.setShipyard(dto.shipyard());
        vessel.setGrossTonnage(dto.grossTonnage());
        vessel.setDeadweightTonnage(dto.deadweightTonnage());
        vessel.setLengthOverall(dto.lengthOverall());
        vessel.setMaxBeam(dto.maxBeam());
        vessel.setOperatingDraft(dto.operatingDraft());
        vessel.setMaxServiceSpeed(dto.maxServiceSpeed());
        vessel.setMainPropulsion(dto.mainPropulsion());
        vessel.setMaxPassengerCapacity(dto.maxPassengerCapacity());
        vessel.setMaxCrewCapacity(dto.maxCrewCapacity());
        vessel.setLifeboatTotalCapacity(dto.lifeboatTotalCapacity());
        vessel.setClassificationSociety(dto.classificationSociety());
        vessel.setIsmCertification(dto.ismCertification());
        vessel.setCertificateExpiryDate(dto.certificateExpiryDate());
        vessel.setOperationalStatus(dto.operationalStatus() != null ? dto.operationalStatus() : "ACTIVE");
        vessel.setIdHomePort(dto.idHomePort());
        vessel.setMainTerminal(dto.mainTerminal());
        vessel.setIdManager(dto.idManager());
        vessel.setOperationalEmail(dto.operationalEmail());

        Vessel savedVessel = vesselRepository.save(vessel);

        if (dto.documents() != null && !dto.documents().isEmpty()) {
            for (VesselRequestDTO.DocumentDTO docDto : dto.documents()) {
                VesselDocument doc = new VesselDocument();
                doc.setVessel(savedVessel);
                doc.setDocumentType(docDto.documentType());
                doc.setFileName(docDto.fileName());
                doc.setFileUrl(docDto.fileUrl());
                doc.setMimeType(docDto.mimeType());
                doc.setFileSizeBytes(docDto.fileSizeBytes());
                documentRepository.save(doc);
            }
        }

        return getVesselById(savedVessel.getIdVessel());
    }

    // LISTAGEM E PESQUISA POR NOME / IMO (numeracao)
    @Transactional(readOnly = true)
    public PagedVesselResponseDTO listVessels(String nome, String status, int page, int limit) {
        int pageIndex = Math.max(0, page - 1); // Converte página 1 (frontend) para 0 (Spring)
        int pageSize = Math.max(1, limit);

        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by("vesselName").ascending());

        String searchFilter = (nome == null) ? "" : nome.trim();
        String statusFilter = (status == null) ? "" : status.trim().toUpperCase();

        Page<Vessel> vesselPage = vesselRepository.searchVessels(searchFilter, statusFilter, pageable);

        List<VesselSummaryDTO> summaries = vesselPage.getContent()
                .stream()
                .map(this::mapToSummaryDTO)
                .toList();

        return new PagedVesselResponseDTO(
                summaries,
                page,
                pageSize,
                vesselPage.getTotalElements(),
                vesselPage.getTotalPages()
        );
    }

    // BUSCAR DETALHES DE UM NAVIO ESPECÍFICO
    @Transactional(readOnly = true)
    public VesselResponseDTO getVesselById(UUID idVessel) {
        Vessel v = vesselRepository.findWithCompanyByIdVessel(idVessel)
                .orElseThrow(() -> new IllegalArgumentException("Embarcação não encontrada com o ID: " + idVessel));

        long deckCount = vesselRepository.countDecksByVesselId(idVessel);
        long cabinCount = vesselRepository.countCabinsByVesselId(idVessel);
        long totalAreas = vesselRepository.countAreasByVesselId(idVessel);

        List<VesselResponseDTO.DocumentResponseDTO> docs = documentRepository.findByVesselIdVessel(idVessel)
                .stream()
                .map(d -> new VesselResponseDTO.DocumentResponseDTO(
                        d.getIdDocument(),
                        d.getDocumentType(),
                        d.getFileName(),
                        d.getFileUrl(),
                        d.getMimeType(),
                        d.getFileSizeBytes(),
                        d.getUploadedAt()
                ))
                .toList();

        return new VesselResponseDTO(
                v.getIdVessel(),
                v.getCompany().getIdCompany(),
                v.getCompany().getCompanyName(),
                v.getVesselName(),
                v.getNationalRegistrationNumber(),
                v.getFlag(),
                v.getImoNumber(),
                v.getPhotoUrl(),
                v.getYearBuilt(),
                v.getShipyard(),
                v.getGrossTonnage(),
                v.getDeadweightTonnage(),
                v.getLengthOverall(),
                v.getMaxBeam(),
                v.getOperatingDraft(),
                v.getMaxServiceSpeed(),
                v.getMainPropulsion(),
                v.getMaxPassengerCapacity(),
                v.getMaxCrewCapacity(),
                v.getLifeboatTotalCapacity(),
                v.getClassificationSociety(),
                v.getIsmCertification(),
                v.getCertificateExpiryDate(),
                v.getOperationalStatus(),
                v.getIdHomePort(),
                v.getMainTerminal(),
                v.getIdManager(),
                v.getOperationalEmail(),
                deckCount,
                cabinCount,
                totalAreas,
                docs,
                v.getCreatedAt(),
                v.getUpdatedAt()
        );
    }

    private VesselSummaryDTO mapToSummaryDTO(Vessel v) {
        long deckCount = vesselRepository.countDecksByVesselId(v.getIdVessel());
        String complianceStatus = evaluateCompliance(v.getCertificateExpiryDate());

        return new VesselSummaryDTO(
                v.getIdVessel(),
                v.getVesselName(),
                v.getCompany().getCompanyName(),
                v.getImoNumber(),
                v.getPhotoUrl(),
                v.getOperationalStatus(),
                v.getMaxPassengerCapacity(),
                deckCount,
                v.getMaxCrewCapacity(),
                v.getIdHomePort(),
                v.getMainTerminal(),
                v.getCertificateExpiryDate(),
                complianceStatus
        );
    }

    private String evaluateCompliance(LocalDate expiryDate) {
        if (expiryDate == null) {
            return "Sem certificado registado";
        }
        long daysUntilExpiry = ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
        if (daysUntilExpiry < 0) {
            return "Certificado vencido";
        } else if (daysUntilExpiry <= 30) {
            return "1 certificado vence em " + daysUntilExpiry + " dias";
        }
        return "Conformidade em dia";
    }
}