package com.costaazul.api.vessel.dto;

import java.util.List;

public record PagedVesselResponseDTO(
        List<VesselSummaryDTO> content,
        int currentPage,
        int pageSize,
        long totalElements,
        int totalPages
) {}