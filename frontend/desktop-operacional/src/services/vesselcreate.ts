import api from "./api";

export interface DocumentDTO {
  documentType: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
}

export interface DocumentResponseDTO extends DocumentDTO {
  idDocument: string;
  uploadedAt: string;
}

export interface VesselRequestDTO {
  idCompany: string | null;
  vesselName: string;
  nationalRegistrationNumber: string;
  flag: string;
  imoNumber: string;
  photoUrl: string | null;
  yearBuilt: number | null;
  shipyard: string;
  grossTonnage: number | null;
  deadweightTonnage: number | null;
  lengthOverall: number | null;
  maxBeam: number | null;
  operatingDraft: number | null;
  maxServiceSpeed: number | null;
  mainPropulsion: string;
  maxPassengerCapacity: number | null;
  maxCrewCapacity: number | null;
  lifeboatTotalCapacity: number | null;
  classificationSociety: string;
  ismCertification: string;
  certificateExpiryDate: string | null;
  operationalStatus: string;
  idHomePort: string | null;
  mainTerminal: string | null;
  idManager: string | null;
  operationalEmail: string;
  documents: DocumentDTO[];
}

/**
 * DTO completo de uma embarcação retornado por `GET /api/erp/vessels/{id}`,
 * `POST /api/erp/vessels`, `PUT /api/erp/vessels/{id}` e `PATCH /api/erp/vessels/{id}`.
 * Espelha `com.costaazul.api.vessel.dto.VesselResponseDTO`.
 */
export interface VesselResponseDTO {
  idVessel: string;
  idCompany: string;
  companyName: string;
  vesselName: string;
  nationalRegistrationNumber: string;
  flag: string;
  imoNumber: string;
  photoUrl: string | null;
  yearBuilt: number;
  shipyard: string;
  grossTonnage: number;
  deadweightTonnage: number | null;
  lengthOverall: number;
  maxBeam: number | null;
  operatingDraft: number | null;
  maxServiceSpeed: number | null;
  mainPropulsion: string | null;
  maxPassengerCapacity: number;
  maxCrewCapacity: number | null;
  lifeboatTotalCapacity: number | null;
  classificationSociety: string | null;
  ismCertification: string | null;
  certificateExpiryDate: string | null;
  operationalStatus: string;
  idHomePort: string | null;
  mainTerminal: string | null;
  idManager: string | null;
  operationalEmail: string | null;
  deckCount: number;
  cabinCount: number;
  totalAreas: number;
  documents?: DocumentResponseDTO[];
  createdAt: string;
  updatedAt?: string;
}

/**
 * DTO resumido de cada item da listagem paginada (`GET /api/erp/vessels`).
 * Espelha `com.costaazul.api.vessel.dto.VesselSummaryDTO`.
 */
export interface VesselSummaryDTO {
  idVessel: string;
  vesselName: string;
  companyName: string;
  imoNumber: string;
  photoUrl: string | null;
  operationalStatus: string;
  maxPassengerCapacity: number;
  deckCount: number;
  maxCrewCapacity: number | null;
  idHomePort: string | null;
  mainTerminal: string | null;
  certificateExpiryDate: string | null;
  complianceStatus: string;
}

/**
 * Envelope paginado retornado por `GET /api/erp/vessels`.
 * Espelha `com.costaazul.api.vessel.dto.PagedVesselResponseDTO`.
 */
export interface PagedVesselResponseDTO {
  content: VesselSummaryDTO[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

/**
 * Parâmetros de consulta aceitos por `GET /api/erp/vessels` no `VesselController`.
 */
export interface VesselListParams {
  /** Pesquisa parcial por nome da embarcação ou número IMO */
  nome?: string;
  /** Filtro opcional por status operacional (ACTIVE, MAINTENANCE, INACTIVE, DRY_DOCK) */
  status?: string;
  /** Filtro opcional por porto base ou terminal operacional */
  porto?: string;
  /** Filtro opcional por conformidade do certificado ISM (VALID, EXPIRING_SOON, EXPIRED, MISSING) */
  conformidade?: string;
  /** Número da página (base 1, padrão: 1) */
  page?: number;
  /** Quantidade de registros por página (padrão: 20) */
  limit?: number;
}

function resolveComplianceCode(
  certificateExpiryDate: string | null | undefined
): "VALID" | "EXPIRING_SOON" | "EXPIRED" | "MISSING" {
  const raw = (certificateExpiryDate ?? "").trim();
  if (!raw) return "MISSING";

  const parts = raw.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return "MISSING";
  }

  const [year, month, day] = parts;
  const expiryLocal = new Date(year, month - 1, day);
  expiryLocal.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (expiryLocal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "EXPIRED";
  if (diffDays <= 30) return "EXPIRING_SOON";
  return "VALID";
}

function matchesPortAndCompliance(
  vessel: VesselSummaryDTO,
  portoFilter?: string,
  complianceFilter?: string
): boolean {
  if (portoFilter) {
    const normalizedPort = portoFilter.toLowerCase();
    const terminal = (vessel.mainTerminal ?? "").trim().toLowerCase();
    const homePortId = (vessel.idHomePort ?? "").trim().toLowerCase();
    const formattedHomePort = homePortId
      ? `porto id ${homePortId.slice(0, 8)}`
      : "";

    const portMatches =
      (terminal.length > 0 && terminal.includes(normalizedPort)) ||
      (homePortId.length > 0 && homePortId.includes(normalizedPort)) ||
      (formattedHomePort.length > 0 &&
        formattedHomePort.includes(normalizedPort));

    if (!portMatches) return false;
  }

  if (complianceFilter) {
    const vesselCompliance = resolveComplianceCode(
      vessel.certificateExpiryDate
    );
    if (vesselCompliance !== complianceFilter) {
      return false;
    }
  }

  return true;
}

/**
 * Normaliza a resposta de `GET /api/erp/vessels` garantindo o contrato `PagedVesselResponseDTO`
 * mesmo se o backend devolver campos nulos ou página vazia.
 */
function normalizePagedVesselResponse(
  raw: unknown,
  requestedPage: number,
  requestedLimit: number
): PagedVesselResponseDTO {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const record = raw as Partial<PagedVesselResponseDTO>;
    const content = Array.isArray(record.content) ? record.content : [];
    const pageSize =
      typeof record.pageSize === "number" && record.pageSize > 0
        ? record.pageSize
        : requestedLimit;
    const currentPage =
      typeof record.currentPage === "number" && record.currentPage > 0
        ? record.currentPage
        : requestedPage;
    const totalElements =
      typeof record.totalElements === "number" && record.totalElements >= 0
        ? record.totalElements
        : content.length;
    const totalPages =
      typeof record.totalPages === "number" && record.totalPages >= 0
        ? record.totalPages
        : totalElements > 0
          ? Math.ceil(totalElements / pageSize)
          : 0;

    return {
      content,
      currentPage,
      pageSize,
      totalElements,
      totalPages,
    };
  }

  throw new Error(
    "Formato de resposta inválido ao consultar a listagem paginada de embarcações."
  );
}

export async function createVessel(
  vessel: VesselRequestDTO
): Promise<VesselResponseDTO> {
  const response = await api.post<VesselResponseDTO>(
    "/api/erp/vessels",
    vessel
  );
  return response.data;
}

export async function listVessels(
  params?: VesselListParams
): Promise<PagedVesselResponseDTO> {
  const requestedPage = Math.max(1, params?.page ?? 1);
  const requestedLimit = Math.max(1, params?.limit ?? 20);

  const queryParams: Record<string, string | number> = {
    page: requestedPage,
    limit: requestedLimit,
  };

  const trimmedName = params?.nome?.trim();
  if (trimmedName) {
    queryParams.nome = trimmedName;
  }

  const trimmedStatus = params?.status?.trim().toUpperCase();
  const activeStatus =
    trimmedStatus && trimmedStatus !== "ALL" ? trimmedStatus : undefined;
  if (activeStatus) {
    queryParams.status = activeStatus;
  }

  const trimmedPort = params?.porto?.trim();
  const activePort =
    trimmedPort && trimmedPort.toUpperCase() !== "ALL"
      ? trimmedPort
      : undefined;
  if (activePort) {
    queryParams.porto = activePort;
  }

  const trimmedCompliance = params?.conformidade?.trim().toUpperCase();
  const activeCompliance =
    trimmedCompliance && trimmedCompliance !== "ALL"
      ? trimmedCompliance
      : undefined;
  if (activeCompliance) {
    queryParams.conformidade = activeCompliance;
  }

  const response = await api.get<PagedVesselResponseDTO>("/api/erp/vessels", {
    params: queryParams,
  });

  const normalized = normalizePagedVesselResponse(
    response.data,
    requestedPage,
    requestedLimit
  );

  // Caso uma instância antiga do backend (ainda não reiniciada) não tenha aplicado
  // os novos parâmetros `porto` ou `conformidade`, garantimos consistência da paginação.
  if (
    (activePort || activeCompliance) &&
    normalized.content.some(
      (item) => !matchesPortAndCompliance(item, activePort, activeCompliance)
    )
  ) {
    let allMatchingServerRecords = normalized.content;
    if (normalized.totalElements > normalized.content.length) {
      const fullResponse = await api.get<PagedVesselResponseDTO>(
        "/api/erp/vessels",
        {
          params: {
            ...(trimmedName ? { nome: trimmedName } : {}),
            ...(activeStatus ? { status: activeStatus } : {}),
            page: 1,
            limit: Math.max(1000, normalized.totalElements),
          },
        }
      );
      allMatchingServerRecords = normalizePagedVesselResponse(
        fullResponse.data,
        1,
        1000
      ).content;
    }

    const filtered = allMatchingServerRecords.filter((item) =>
      matchesPortAndCompliance(item, activePort, activeCompliance)
    );
    const totalElements = filtered.length;
    const totalPages =
      totalElements > 0 ? Math.ceil(totalElements / requestedLimit) : 0;
    const startIndex = (requestedPage - 1) * requestedLimit;
    const content = filtered.slice(startIndex, startIndex + requestedLimit);

    return {
      content,
      currentPage: requestedPage,
      pageSize: requestedLimit,
      totalElements,
      totalPages,
    };
  }

  return normalized;
}

export async function getVesselById(
  idVessel: string
): Promise<VesselResponseDTO> {
  const response = await api.get<VesselResponseDTO>(
    `/api/erp/vessels/${idVessel}`
  );
  return response.data;
}

export async function updateVessel(
  idVessel: string,
  vessel: Partial<VesselRequestDTO>
): Promise<VesselResponseDTO> {
  const response = await api.put<VesselResponseDTO>(
    `/api/erp/vessels/${idVessel}`,
    vessel
  );
  return response.data;
}

export async function patchVessel(
  idVessel: string,
  vessel: Partial<VesselRequestDTO>
): Promise<VesselResponseDTO> {
  const response = await api.patch<VesselResponseDTO>(
    `/api/erp/vessels/${idVessel}`,
    vessel
  );
  return response.data;
}
