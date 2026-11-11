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
            description = "Devolve a lista resumida de navios paginada com filtros opcionais por nome/IMO, porto atual e conformidade (em operação, em manutenção ou fora de serviço)."
    )
    public ResponseEntity<PagedVesselResponseDTO> listVessels(
            @Parameter(description = "Pesquisa parcial por nome do navio ou número IMO (ex: Atlantis)")
            @RequestParam(name = "nome", required = false) String nome,

            @Parameter(description = "Filtro por nome do porto/terminal onde o navio está atracado (ex: Santos)")
            @RequestParam(name = "porto", required = false) String porto,

            @Parameter(description = "Filtro opcional pelo UUID do porto base (id_home_port)")
            @RequestParam(name = "idPorto", required = false) UUID idPorto,

            @Parameter(description = "Filtro de conformidade/status: EM_OPERACAO (ACTIVE), EM_MANUTENCAO (MAINTENANCE) ou FORA_DE_SERVICO (INACTIVE)")
            @RequestParam(name = "conformidade", required = false) String conformidade,

            @Parameter(description = "Número da página (começa em 1)")
            @RequestParam(name = "page", defaultValue = "1") int page,

            @Parameter(description = "Quantidade de navios por página")
            @RequestParam(name = "limit", defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(vesselService.listVessels(nome, porto, idPorto, conformidade, page, limit));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Ver detalhes completos de uma embarcação",
            description = "Devolve todos os dados técnicos, contagens de conveses/cabines/áreas e documentos anexados de um navio específico."
    )
    public ResponseEntity<VesselResponseDTO> getVesselById(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(vesselService.getVesselById(id));
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Editar embarcação (Completa ou por Seção)",
            description = "Atualiza os dados de uma embarcação existente. Campos não enviados (null) permanecem com seus valores atuais."
    )
    public ResponseEntity<VesselResponseDTO> updateVessel(
            @PathVariable("id") UUID id,
            @RequestBody VesselRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(vesselService.updateVessel(id, requestDTO));
    }

    @PatchMapping("/{id}")
    @Operation(
            summary = "Editar seção específica da embarcação (Parcial)",
            description = "Permite atualizar apenas um card ou campo isolado (ex: Base operacional & gestão) sem precisar enviar o restante dos dados."
    )
    public ResponseEntity<VesselResponseDTO> patchVessel(
            @PathVariable("id") UUID id,
            @RequestBody VesselRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(vesselService.updateVessel(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Remover embarcação",
            description = "Exclui permanentemente uma embarcação e suas dependências. Aceita o nome ou código (IMO/Registro) para validação de segurança do modal."
    )
    public ResponseEntity<Void> deleteVessel(
            @PathVariable("id") UUID id,
            @Parameter(description = "Nome da embarcação ou código (IMO / Registro Nacional) para confirmar a exclusão")
            @RequestParam(name = "confirmacao", required = false) String confirmacao
    ) {
        vesselService.deleteVessel(id, confirmacao);
        return ResponseEntity.noContent().build(); // Retorna Status 204 (No Content)
    }
}