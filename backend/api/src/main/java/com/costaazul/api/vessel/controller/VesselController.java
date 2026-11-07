package com.costaazul.api.vessel.controller;

import com.costaazul.api.vessel.dto.PagedVesselResponseDTO;
import com.costaazul.api.vessel.dto.VesselRequestDTO;
import com.costaazul.api.vessel.dto.VesselResponseDTO;
import com.costaazul.api.vessel.service.VesselService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/erp/vessels")
@Tag(name = "Embarcações (ERP)", description = "Endpoints para cadastro, listagem paginada e gestão da frota de navios")
public class VesselController {

    private final VesselService vesselService;

    public VesselController(VesselService vesselService) {
        this.vesselService = vesselService;
    }

    @PostMapping
    @Operation(summary = "Cadastrar nova embarcação", description = "Regista um novo navio com todas as 5 secções técnicas e metadados de documentação.")
    public ResponseEntity<VesselResponseDTO> createVessel(@RequestBody VesselRequestDTO requestDTO) {
        VesselResponseDTO response = vesselService.createVessel(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(
            summary = "Listar e pesquisar embarcações da frota (Paginado)",
            description = "Devolve a lista resumida de navios paginada (padrão: page=1, limit=20) com filtro opcional por nome/IMO e status operacional."
    )
    public ResponseEntity<PagedVesselResponseDTO> listVessels(
            @Parameter(description = "Pesquisa parcial por nome do navio ou número IMO (ex: Atlantis)")
            @RequestParam(name = "nome", required = false) String nome,

            @Parameter(description = "Filtro opcional por status (ACTIVE, INACTIVE, MAINTENANCE, DRY_DOCK)")
            @RequestParam(name = "status", required = false) String status,

            @Parameter(description = "Número da página (começa em 1)")
            @RequestParam(name = "page", defaultValue = "1") int page,

            @Parameter(description = "Quantidade de navios por página")
            @RequestParam(name = "limit", defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(vesselService.listVessels(nome, status, page, limit));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Ver detalhes completos de uma embarcação",
            description = "Devolve todos os dados técnicos, contagens de conveses/cabines/áreas e documentos anexados de um navio específico."
    )
    public ResponseEntity<VesselResponseDTO> getVesselById(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(vesselService.getVesselById(id));
    }
}