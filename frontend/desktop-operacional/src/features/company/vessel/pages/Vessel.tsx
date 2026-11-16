import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb, Button } from "../../../../components";
import { listVessels, type PagedVesselResponseDTO, type VesselSummaryDTO } from "../../../../services/vesselcreate";
import "./Vessel.css";
import { VesselFleetFeedbackStates } from "../componets/VesselFleetFeedbackStates";
import { VesselFleetGrid } from "../componets/VesselFleetGrid";
import { VesselFleetKpis } from "../componets/VesselFleetKpis";
import { VesselFleetTable } from "../componets/VesselFleetTable";
import { VesselFleetToolbar } from "../componets/VesselFleetToolbar";
import { buildActiveFilterSummaryText, calculateFleetKpis, extractBasePortOptions, FLEET_SUMMARY_LIMIT, INITIAL_PAGED_STATE, PAGE_SIZE_GRID, PAGE_SIZE_LIST, parseVesselApiError, SEARCH_DEBOUNCE_MS, type FleetViewMode, type VesselComplianceFilterValue, type VesselStatusFilterValue } from "../utils";

// AQUI É A PÁGINA PRINCIPAL DE LISTAGEM DE EMBARCAÇÕES (Frota e Viagens > Navios)

export function Vessel() {
  const navigate = useNavigate();

  // Controles de busca, filtros, visualização e paginação (server-side)
  const [searchQuery, setSearchQuery] = useState<string>(""); // busca textual (nome ou IMO)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>(""); // captação de pesquisa
  const [statusFilter, setStatusFilter] =
    useState<VesselStatusFilterValue>("ALL"); // filtro de status
  const [basePortFilter, setBasePortFilter] = useState<string>("ALL"); // filtro de porto
  const [complianceFilter, setComplianceFilter] =
    useState<VesselComplianceFilterValue>("ALL"); // filtro de conformidade/certificado
  const [viewMode, setViewMode] = useState<FleetViewMode>("grid"); // visualização da frota (grade ou lista)
  const [currentPage, setCurrentPage] = useState<number>(1); // index da página
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0); // recarregar

  // Estado da página atual retornada pelo backend (GET /api/erp/vessels)
  const [pagedData, setPagedData] =
    useState<PagedVesselResponseDTO>(INITIAL_PAGED_STATE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estado do resumo global da frota (escopo completo para KPIs e opções de Porto Base)
  const [fleetOverviewVessels, setFleetOverviewVessels] = useState<
    VesselSummaryDTO[]
  >([]);
  const [fleetTotalElements, setFleetTotalElements] = useState<number>(0);
  const [isOverviewLoading, setIsOverviewLoading] = useState<boolean>(true);

  const pageSize = viewMode === "grid" ? PAGE_SIZE_GRID : PAGE_SIZE_LIST;

  // Evita uma requisição a cada tecla digitada na busca, disparando apenas quando o usuário parar de digitar por 300ms
  useEffect(() => {
    const trimmed = searchQuery.trim();
    const timer = window.setTimeout(() => {
      setDebouncedSearchQuery((prev) => {
        if (prev !== trimmed) {
          setIsLoading(true);
          setErrorMessage(null);
        }
        return trimmed;
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  // Carrega o panorama completo da frota (sem filtros) para cálculo fidedigno dos KPIs e opções de Porto Base
  useEffect(() => {
    let cancelled = false;

    listVessels({ page: 1, limit: FLEET_SUMMARY_LIMIT })
      .then((response) => {
        if (!cancelled) {
          setFleetOverviewVessels(response.content);
          setFleetTotalElements(response.totalElements);
        }
      })
      .catch(() => {
        // Erros de conexão já são exibidos pelo efeito principal da listagem paginada
      })
      .finally(() => {
        if (!cancelled) {
          setIsOverviewLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]);

  // Busca paginada no servidor sempre que filtros, página, tamanho de página ou atualização mudarem
  useEffect(() => {
    let cancelled = false;

    listVessels({
      nome: debouncedSearchQuery || undefined,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
      porto: basePortFilter !== "ALL" ? basePortFilter : undefined,
      conformidade: complianceFilter !== "ALL" ? complianceFilter : undefined,
      page: currentPage,
      limit: pageSize,
    })
      .then((response) => {
        if (cancelled) return;

        // Se a página solicitada ficou além do total de páginas após alteração de dados, recua para a última página válida
        if (response.totalPages > 0 && currentPage > response.totalPages) {
          setCurrentPage(response.totalPages);
          return;
        }

        setPagedData(response);
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setErrorMessage(parseVesselApiError(error));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    debouncedSearchQuery,
    statusFilter,
    basePortFilter,
    complianceFilter,
    currentPage,
    pageSize,
    refreshTrigger,
  ]);

  const startListingRequest = useCallback(() => {
    setIsLoading(true);
    setErrorMessage(null);
  }, []);

  const handleRefreshFleet = useCallback(() => {
    setIsLoading(true);
    setIsOverviewLoading(true);
    setErrorMessage(null);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const basePortOptions = useMemo(
    () => extractBasePortOptions(fleetOverviewVessels, basePortFilter),
    [fleetOverviewVessels, basePortFilter]
  );

  const fleetKpis = useMemo(
    () => calculateFleetKpis(fleetOverviewVessels, fleetTotalElements),
    [fleetOverviewVessels, fleetTotalElements]
  );

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    statusFilter !== "ALL" ||
    basePortFilter !== "ALL" ||
    complianceFilter !== "ALL";

  const handleClearAllFilters = useCallback(() => {
    startListingRequest();
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setStatusFilter("ALL");
    setBasePortFilter("ALL");
    setComplianceFilter("ALL");
    setCurrentPage(1);
  }, [startListingRequest]);

  const handleSearchChange = useCallback(
    (nextValue: string) => {
      setSearchQuery(nextValue);
      setCurrentPage(1);
      if (!nextValue.trim()) {
        startListingRequest();
        setDebouncedSearchQuery("");
      }
    },
    [startListingRequest]
  );

  const handleClearSearchFilter = useCallback(() => {
    startListingRequest();
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setCurrentPage(1);
  }, [startListingRequest]);

  const handleStatusFilterChange = useCallback(
    (nextStatus: VesselStatusFilterValue) => {
      startListingRequest();
      setStatusFilter(nextStatus);
      setCurrentPage(1);
    },
    [startListingRequest]
  );

  const handleBasePortFilterChange = useCallback(
    (nextPort: string) => {
      startListingRequest();
      setBasePortFilter(nextPort);
      setCurrentPage(1);
    },
    [startListingRequest]
  );

  const handleComplianceFilterChange = useCallback(
    (nextCompliance: VesselComplianceFilterValue) => {
      startListingRequest();
      setComplianceFilter(nextCompliance);
      setCurrentPage(1);
    },
    [startListingRequest]
  );

  const handleViewModeChange = useCallback(
    (nextMode: FleetViewMode) => {
      if (viewMode !== nextMode) {
        startListingRequest();
        setViewMode(nextMode);
        setCurrentPage(1);
      }
    },
    [viewMode, startListingRequest]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      startListingRequest();
      setCurrentPage(page);
    },
    [startListingRequest]
  );

  const handleOpenVessel = useCallback(
    (vessel: VesselSummaryDTO) => {
      navigate(`/vessel/${vessel.idVessel}`);
    },
    [navigate]
  );

  const activeFilterSummaryText = useMemo(
    () =>
      buildActiveFilterSummaryText({
        searchQuery,
        statusFilter,
        basePortFilter,
        complianceFilter,
      }),
    [searchQuery, statusFilter, basePortFilter, complianceFilter]
  );

  const vessels = pagedData.content;
  const totalElements = pagedData.totalElements;
  const totalPages = Math.max(1, pagedData.totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const isEmptyFleet =
    !isLoading &&
    !errorMessage &&
    totalElements === 0 &&
    !hasActiveFilters &&
    fleetTotalElements === 0;

  const isEmptyFilteredSearch =
    !isLoading &&
    !errorMessage &&
    totalElements === 0 &&
    (hasActiveFilters || fleetTotalElements > 0);

  return (
    <div className="vessel-fleet-page">
      <div className="vessel-fleet-container">
        {/* Cabeçalho da página (Figma #5932:31687) */}
        <header className="vessel-fleet-header">
          <div className="vessel-fleet-header__left">
            <Breadcrumb
              items={[
                { label: "Frota e Viagens", to: "/vessel" },
                { label: "Navios" },
              ]}
            />
            <div className="vessel-fleet-header__titles">
              <h1 className="vessel-fleet-header__title">Navios</h1>
              <p className="vessel-fleet-header__subtitle">
                Frota cadastrada, status operacional, viagens em curso e alertas
                de conformidade.
              </p>
            </div>
          </div>

          <div className="vessel-fleet-header__actions">
            <Button
              type="button"
              variant="secondary"
              size="md"
              icon="pi-refresh"
              onClick={handleRefreshFleet}
              disabled={isLoading}
            >
              Atualizar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              icon="pi-plus"
              onClick={() => navigate("/vessel/create")}
            >
              Cadastrar embarcação
            </Button>
          </div>
        </header>

        {/* Linha de KPIs (Figma #5932:31702) */}
        <VesselFleetKpis
          fleetKpis={fleetKpis}
          isOverviewLoading={isOverviewLoading}
        />

        {/* Barra de Busca, Filtros e Seletor de Visualização (Figma #5932:31730) */}
        <VesselFleetToolbar
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          basePortFilter={basePortFilter}
          complianceFilter={complianceFilter}
          basePortOptions={basePortOptions}
          viewMode={viewMode}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={handleSearchChange}
          onClearSearchFilter={handleClearSearchFilter}
          onStatusFilterChange={handleStatusFilterChange}
          onBasePortFilterChange={handleBasePortFilterChange}
          onComplianceFilterChange={handleComplianceFilterChange}
          onViewModeChange={handleViewModeChange}
          onClearAllFilters={handleClearAllFilters}
        />

        {/* Estados de Erro, Carregamento e Lista Vazia */}
        <VesselFleetFeedbackStates
          errorMessage={errorMessage}
          isLoading={isLoading}
          viewMode={viewMode}
          isEmptyFleet={isEmptyFleet}
          isEmptyFilteredSearch={isEmptyFilteredSearch}
          activeFilterSummaryText={activeFilterSummaryText}
          onRetry={handleRefreshFleet}
          onClearAllFilters={handleClearAllFilters}
          onCreateVessel={() => navigate("/vessel/create")}
        />

        {/* Listagem em Grade (Figma N · 01 #5932:31743) */}
        {!isLoading &&
          !errorMessage &&
          vessels.length > 0 &&
          viewMode === "grid" && (
            <VesselFleetGrid
              vessels={vessels}
              safeCurrentPage={safeCurrentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              isLoading={isLoading}
              onOpenVessel={handleOpenVessel}
              onPageChange={handlePageChange}
            />
          )}

        {/* Listagem em Tabela com Paginação integrada no rodapé (Figma N · 02 #5932:31796) */}
        {!errorMessage &&
          (isLoading || vessels.length > 0) &&
          viewMode === "list" && (
            <VesselFleetTable
              vessels={vessels}
              isLoading={isLoading}
              safeCurrentPage={safeCurrentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onOpenVessel={handleOpenVessel}
              onPageChange={handlePageChange}
            />
          )}
      </div>
    </div>
  );
}
