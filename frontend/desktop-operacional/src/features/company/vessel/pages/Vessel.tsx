import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {Alert,Badge,Breadcrumb,Button,DataTable,EmptyState,FilterChip,IconButton,Input,KPI,Pagination,Select,VesselCard,type DataTableColumn} from "../../../../components";
import {listVessels,type PagedVesselResponseDTO,type VesselSummaryDTO} from "../../../../services/vesselcreate";

import { calculateFleetKpis, evaluateVesselCompliance, extractBasePortOptions, getVesselBasePortDisplay, getVesselStatusDisplay, parseVesselApiError, resolveSafeVesselPhotoUrl, VESSEL_COMPLIANCE_FILTER_OPTIONS, VESSEL_STATUS_FILTER_OPTIONS, type VesselComplianceFilterValue, type VesselStatusFilterValue } from "../vesselListingUtils";
import "./Vessel.css";
import { formatMetric } from "../form";

type FleetViewMode = "grid" | "list"; // Tipo de visualização da frota: grade ou lista

const PAGE_SIZE_GRID = 6; // grid apenas 06
const PAGE_SIZE_LIST = 10; // lista apenas 10
const FLEET_SUMMARY_LIMIT = 1000; 
const SEARCH_DEBOUNCE_MS = 300; // limite para a pesquisa. 

// pagina vazia inicial para evitar undefined
const INITIAL_PAGED_STATE: PagedVesselResponseDTO = {
  content: [],
  currentPage: 1,
  pageSize: PAGE_SIZE_GRID,
  totalElements: 0,
  totalPages: 0,
};

// AQUI È A PAGINA PRINCIPAL DE LISTAGEM DE EMBARCAÇÕES (Frota e Viagens > Navios)

export function Vessel() {
  const navigate = useNavigate();

  // Controles de busca, filtros, visualização e paginação (server-side)
  const [searchQuery, setSearchQuery] = useState<string>(""); //busca textual (nome ou IMO)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>(""); // captação de pesquisa
  const [statusFilter, setStatusFilter] = useState<VesselStatusFilterValue>("ALL"); // filtro de status
  const [basePortFilter, setBasePortFilter] = useState<string>("ALL"); // filtro de porto
  const [complianceFilter, setComplianceFilter] = useState<VesselComplianceFilterValue>("ALL"); // filtro de conformidade/certificado
  const [viewMode, setViewMode] = useState<FleetViewMode>("grid"); // vizualização da frota (grade ou lista)
  const [currentPage, setCurrentPage] = useState<number>(1); // index da pagina (1, 2 ou 3)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0); // recarregar

  // Estado da página atual retornada pelo backend (GET /api/erp/vessels)
  const [pagedData, setPagedData] = useState<PagedVesselResponseDTO>(INITIAL_PAGED_STATE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estado do resumo global da frota (escopo completo para KPIs e opções de Porto Base)
  const [fleetOverviewVessels, setFleetOverviewVessels] = useState<VesselSummaryDTO[] >([]);
  const [fleetTotalElements, setFleetTotalElements] = useState<number>(0);
  const [isOverviewLoading, setIsOverviewLoading] = useState<boolean>(true);

  const pageSize = viewMode === "grid" ? PAGE_SIZE_GRID : PAGE_SIZE_LIST;

  // Isso aqui é para evitar uma requiusição a cada tecla digitada na busca, e sim apenas quando o usuário parar de digitar por 300ms
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

  //parei aqui

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

  const handleOpenVessel = useCallback(
    (vessel: VesselSummaryDTO) => {
      navigate(`/vessel/${vessel.idVessel}`);
    },
    [navigate]
  );

  // Colunas da visualização em Lista (Figma N · 02 #5932:31796)
  const tableColumns = useMemo<DataTableColumn<VesselSummaryDTO>[]>(
    () => [
      {
        key: "vessel",
        header: "Navio",
        width: "260px",
        render: (vessel) => {
          const safePhoto = resolveSafeVesselPhotoUrl(vessel.photoUrl);
          return (
            <div className="vessel-table-ship">
              <div className="vessel-table-ship__thumb" aria-hidden="true">
                {safePhoto ? (
                  <img src={safePhoto} alt="" />
                ) : (
                  <i className="pi pi-compass" />
                )}
              </div>
              <div className="vessel-table-ship__info">
                <button
                  type="button"
                  className="vessel-table-ship__name"
                  onClick={() => handleOpenVessel(vessel)}
                >
                  {vessel.vesselName}
                </button>
                <span className="vessel-table-ship__imo">
                  IMO {vessel.imoNumber || "—"}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        width: "150px",
        render: (vessel) => {
          const status = getVesselStatusDisplay(vessel.operationalStatus);
          return (
            <Badge tone={status.tone} dot>
              {status.label}
            </Badge>
          );
        },
      },
      {
        key: "currentTrip",
        header: "Viagem atual",
        render: () => (
          <div className="vessel-table-trip">
            <span className="vessel-table-trip__empty">Sem viagem ativa</span>
            <span className="vessel-table-trip__sub">
              Módulo de viagens não integrado
            </span>
          </div>
        ),
      },
      {
        key: "occupancy",
        header: "Ocupação",
        width: "120px",
        render: () => (
          <span
            className="vessel-table-placeholder"
            title="Dados de embarque em tempo real ainda não disponíveis na API"
          >
            —
          </span>
        ),
      },
      {
        key: "capacity",
        header: "Capacidade",
        align: "right",
        tabular: true,
        width: "120px",
        render: (vessel) => (
          <div className="vessel-table-capacity">
            <span className="vessel-table-capacity__main">
              {formatMetric(vessel.maxPassengerCapacity)}
            </span>
            <span className="vessel-table-capacity__sub">
              {formatMetric(vessel.maxCrewCapacity)} trip.
            </span>
          </div>
        ),
      },
      {
        key: "basePort",
        header: "Porto base",
        width: "170px",
        render: (vessel) => (
          <span className="vessel-table-port">
            {getVesselBasePortDisplay(vessel)}
          </span>
        ),
      },
      {
        key: "compliance",
        header: "Conformidade",
        width: "200px",
        render: (vessel) => {
          const compliance = evaluateVesselCompliance(
            vessel.certificateExpiryDate
          );
          return (
            <div
              className={`vessel-table-compliance vessel-table-compliance--${compliance.cardTone}`}
            >
              <i className={`pi ${compliance.iconName}`} aria-hidden="true" />
              <div className="vessel-table-compliance__texts">
                <span className="vessel-table-compliance__label">
                  {compliance.shortLabel}
                </span>
                {compliance.expiryFormatted !== "—" && (
                  <span className="vessel-table-compliance__date">
                    Validade: {compliance.expiryFormatted}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: "actions",
        header: "Ações",
        align: "right",
        width: "76px",
        render: (vessel) => (
          <div className="vessel-table-actions">
            <IconButton
              icon="pi-arrow-right"
              variant="ghost"
              size="sm"
              aria-label={`Abrir ficha de ${vessel.vesselName}`}
              title="Abrir ficha da embarcação"
              onClick={() => handleOpenVessel(vessel)}
            />
          </div>
        ),
      },
    ],
    [handleOpenVessel]
  );

  // Monta descrição dos filtros ativos para o estado vazio de busca (Figma N · 03 #5932:32022)
  const activeFilterSummaryText = useMemo(() => {
    const parts: string[] = [];
    if (searchQuery.trim()) {
      parts.push(`Busca = "${searchQuery.trim()}"`);
    }
    if (statusFilter !== "ALL") {
      const label =
        VESSEL_STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter)
          ?.label ?? statusFilter;
      parts.push(`Status = ${label}`);
    }
    if (basePortFilter !== "ALL") {
      parts.push(`Porto base = ${basePortFilter}`);
    }
    if (complianceFilter !== "ALL") {
      const label =
        VESSEL_COMPLIANCE_FILTER_OPTIONS.find(
          (o) => o.value === complianceFilter
        )?.label ?? complianceFilter;
      parts.push(`Conformidade = ${label}`);
    }
    return parts.join(", ");
  }, [searchQuery, statusFilter, basePortFilter, complianceFilter]);

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

  const kpiComplianceTone =
    fleetKpis.expiredCertificatesCount > 0
      ? "error"
      : fleetKpis.expiringSoonCertificatesCount > 0
        ? "warning"
        : fleetKpis.totalCount > 0 && fleetKpis.missingCertificatesCount === 0
          ? "success"
          : "neutral";

  const kpiComplianceHighlightText =
    fleetKpis.totalCount === 0
      ? "Sem registros"
      : fleetKpis.totalComplianceAlerts > 0
        ? `${fleetKpis.expiredCertificatesCount} vencido(s) · ${fleetKpis.expiringSoonCertificatesCount} em até 30d`
        : fleetKpis.missingCertificatesCount > 0
          ? `${fleetKpis.missingCertificatesCount} sem validade`
          : "Conformidade em dia";

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
        <section
          className="vessel-fleet-kpis"
          aria-label="Indicadores operacionais da frota"
        >
          <KPI
            label="Embarcações em operação"
            icon="pi-compass"
            loading={isOverviewLoading}
            value={String(fleetKpis.activeCount)}
            highlightText={`de ${fleetKpis.totalCount} na frota`}
            highlightTone={fleetKpis.activeCount > 0 ? "success" : "neutral"}
            detailText={
              fleetKpis.totalCount > 0
                ? `${fleetKpis.maintenanceCount} em manutenção · ${fleetKpis.inactiveCount} fora de serviço`
                : "Nenhuma embarcação cadastrada"
            }
          />

          <KPI
            label="Viagens em curso"
            icon="pi-send"
            loading={isOverviewLoading}
            value="—"
            highlightText="Não integrado"
            highlightTone="neutral"
            detailText="Módulo de viagens ainda não integrado à API"
          />

          <KPI
            label="Passageiros a bordo"
            icon="pi-users"
            loading={isOverviewLoading}
            value="—"
            highlightText={
              fleetKpis.totalPassengerCapacity > 0
                ? `Cap. frota: ${fleetKpis.totalPassengerCapacity.toLocaleString("pt-BR")}`
                : "Sem capacidade nominal"
            }
            highlightTone="neutral"
            detailText="Embarque em tempo real indisponível no backend"
          />

          <KPI
            label="Alertas de conformidade"
            icon="pi-shield"
            loading={isOverviewLoading}
            value={String(fleetKpis.totalComplianceAlerts)}
            highlightText={kpiComplianceHighlightText}
            highlightTone={kpiComplianceTone}
            detailText={
              fleetKpis.missingCertificatesCount > 0
                ? `${fleetKpis.missingCertificatesCount} certificado(s) sem data informada`
                : "Monitoramento da validade do certificado ISM"
            }
          />
        </section>

        {/* Barra de Busca, Filtros e Seletor de Visualização (Figma #5932:31730) */}
        <section
          className="vessel-fleet-toolbar-card"
          aria-label="Filtros e busca de embarcações"
        >
          <div className="vessel-fleet-toolbar">
            <div className="vessel-fleet-toolbar__search">
              <Input
                type="search"
                size="sm"
                placeholder="Buscar por nome ou IMO..."
                leftIcon="pi-search"
                value={searchQuery}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setSearchQuery(nextValue);
                  setCurrentPage(1);
                  if (!nextValue.trim()) {
                    startListingRequest();
                    setDebouncedSearchQuery("");
                  }
                }}
                aria-label="Buscar embarcação por nome ou número IMO"
              />
            </div>

            <div className="vessel-fleet-toolbar__filters">
              <div className="vessel-fleet-toolbar__select">
                <Select
                  size="sm"
                  prefixLabel="Status:"
                  options={VESSEL_STATUS_FILTER_OPTIONS}
                  value={statusFilter}
                  onChange={(e) => {
                    startListingRequest();
                    setStatusFilter(e.target.value as VesselStatusFilterValue);
                    setCurrentPage(1);
                  }}
                  aria-label="Filtrar por status operacional"
                />
              </div>

              <div className="vessel-fleet-toolbar__select">
                <Select
                  size="sm"
                  prefixLabel="Porto base:"
                  options={basePortOptions}
                  value={basePortFilter}
                  onChange={(e) => {
                    startListingRequest();
                    setBasePortFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Filtrar por porto base ou terminal"
                />
              </div>

              <div className="vessel-fleet-toolbar__select">
                <Select
                  size="sm"
                  prefixLabel="Conformidade:"
                  options={VESSEL_COMPLIANCE_FILTER_OPTIONS}
                  value={complianceFilter}
                  onChange={(e) => {
                    startListingRequest();
                    setComplianceFilter(
                      e.target.value as VesselComplianceFilterValue
                    );
                    setCurrentPage(1);
                  }}
                  aria-label="Filtrar por situação de conformidade"
                />
              </div>
            </div>

            <div
              className="vessel-fleet-view-switcher"
              role="group"
              aria-label="Alternar modo de visualização"
            >
              <button
                type="button"
                className={`vessel-fleet-view-switcher__btn ${
                  viewMode === "grid"
                    ? "vessel-fleet-view-switcher__btn--active"
                    : ""
                }`}
                onClick={() => {
                  if (viewMode !== "grid") {
                    startListingRequest();
                    setViewMode("grid");
                    setCurrentPage(1);
                  }
                }}
                aria-pressed={viewMode === "grid"}
              >
                <i className="pi pi-th-large" aria-hidden="true" />
                <span>Grade</span>
              </button>
              <button
                type="button"
                className={`vessel-fleet-view-switcher__btn ${
                  viewMode === "list"
                    ? "vessel-fleet-view-switcher__btn--active"
                    : ""
                }`}
                onClick={() => {
                  if (viewMode !== "list") {
                    startListingRequest();
                    setViewMode("list");
                    setCurrentPage(1);
                  }
                }}
                aria-pressed={viewMode === "list"}
              >
                <i className="pi pi-list" aria-hidden="true" />
                <span>Lista</span>
              </button>
            </div>
          </div>

          {/* Linha de chips de filtros aplicados (Figma #5932:32017) */}
          {hasActiveFilters && (
            <div className="vessel-fleet-applied-filters">
              <span className="vessel-fleet-applied-filters__label">
                Filtros ativos:
              </span>

              <div className="vessel-fleet-applied-filters__chips">
                {searchQuery.trim() && (
                  <FilterChip
                    selected
                    icon="pi-times"
                    title="Remover filtro de busca"
                    onClick={() => {
                      startListingRequest();
                      setSearchQuery("");
                      setDebouncedSearchQuery("");
                      setCurrentPage(1);
                    }}
                  >
                    Busca: &ldquo;{searchQuery.trim()}&rdquo;
                  </FilterChip>
                )}

                {statusFilter !== "ALL" && (
                  <FilterChip
                    selected
                    icon="pi-times"
                    title="Remover filtro de status"
                    onClick={() => {
                      startListingRequest();
                      setStatusFilter("ALL");
                      setCurrentPage(1);
                    }}
                  >
                    Status:{" "}
                    {VESSEL_STATUS_FILTER_OPTIONS.find(
                      (opt) => opt.value === statusFilter
                    )?.label ?? statusFilter}
                  </FilterChip>
                )}

                {basePortFilter !== "ALL" && (
                  <FilterChip
                    selected
                    icon="pi-times"
                    title="Remover filtro de porto base"
                    onClick={() => {
                      startListingRequest();
                      setBasePortFilter("ALL");
                      setCurrentPage(1);
                    }}
                  >
                    Porto base: {basePortFilter}
                  </FilterChip>
                )}

                {complianceFilter !== "ALL" && (
                  <FilterChip
                    selected
                    icon="pi-times"
                    title="Remover filtro de conformidade"
                    onClick={() => {
                      startListingRequest();
                      setComplianceFilter("ALL");
                      setCurrentPage(1);
                    }}
                  >
                    Conformidade:{" "}
                    {VESSEL_COMPLIANCE_FILTER_OPTIONS.find(
                      (opt) => opt.value === complianceFilter
                    )?.label ?? complianceFilter}
                  </FilterChip>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearAllFilters}
              >
                Limpar tudo
              </Button>
            </div>
          )}
        </section>

        {/* Tratamento de Erro da API */}
        {errorMessage && (
          <Alert
            variant="error"
            title="Falha ao carregar embarcações"
            description={errorMessage}
            actionLabel="Tentar novamente"
            onAction={handleRefreshFleet}
          />
        )}

        {/* Estado de Carregamento no modo Grade */}
        {isLoading && !errorMessage && viewMode === "grid" && (
          <div className="vessel-fleet-loading" role="status" aria-live="polite">
            <i className="pi pi-spin pi-spinner" aria-hidden="true" />
            <span>Carregando embarcações cadastradas...</span>
          </div>
        )}

        {/* Estado Vazio: nenhuma embarcação cadastrada no banco */}
        {isEmptyFleet && (
          <div className="vessel-fleet-empty-wrapper">
            <EmptyState
              icon="pi-compass"
              title="Nenhuma embarcação cadastrada"
              description="Cadastre a primeira embarcação da sua empresa para acompanhar especificações técnicas, capacidade, certificações e viagens."
              actionLabel="Cadastrar embarcação"
              actionIcon="pi-plus"
              onAction={() => navigate("/vessel/create")}
            />
          </div>
        )}

        {/* Estado Vazio: busca ou filtros não encontraram resultados (Figma N · 03 #5932:32022) */}
        {isEmptyFilteredSearch && (
          <div className="vessel-fleet-empty-wrapper">
            <EmptyState
              icon="pi-search"
              title="Nenhuma embarcação encontrada"
              description={`Não há embarcações com os filtros atuais (${activeFilterSummaryText}). Ajuste os filtros ou limpe tudo para voltar à lista completa.`}
              secondaryActionLabel="Limpar filtros"
              onSecondaryAction={handleClearAllFilters}
              actionLabel="Cadastrar embarcação"
              actionIcon="pi-plus"
              onAction={() => navigate("/vessel/create")}
            />
          </div>
        )}

        {/* Listagem em Grade (Figma N · 01 #5932:31743) */}
        {!isLoading &&
          !errorMessage &&
          vessels.length > 0 &&
          viewMode === "grid" && (
            <>
              <section
                className="vessel-fleet-grid"
                aria-label="Grade de embarcações"
              >
                {vessels.map((vessel) => {
                  const status = getVesselStatusDisplay(
                    vessel.operationalStatus
                  );
                  const compliance = evaluateVesselCompliance(
                    vessel.certificateExpiryDate
                  );
                  const basePort = getVesselBasePortDisplay(vessel);

                  return (
                    <VesselCard
                      key={vessel.idVessel}
                      name={vessel.vesselName}
                      subtitle={vessel.companyName || "Empresa não informada"}
                      imo={vessel.imoNumber || "—"}
                      photoUrl={resolveSafeVesselPhotoUrl(vessel.photoUrl)}
                      status={{
                        label: status.label,
                        tone: status.tone,
                      }}
                      metrics={[
                        {
                          label: "Passageiros",
                          value: formatMetric(vessel.maxPassengerCapacity),
                        },
                        {
                          label: "Conveses",
                          value: String(vessel.deckCount ?? 0),
                        },
                        {
                          label: "Tripulação",
                          value: formatMetric(vessel.maxCrewCapacity),
                        },
                      ]}
                      idleInfo={{
                        icon: "pi-anchor",
                        text:
                          basePort !== "—"
                            ? `Sem viagem ativa · Base: ${basePort}`
                            : "Sem viagem ativa · Porto base não informado",
                      }}
                      compliance={{
                        label: compliance.cardLabel,
                        tone: compliance.badgeTone,
                      }}
                      openLabel="Abrir ficha"
                      onOpen={() => handleOpenVessel(vessel)}
                    />
                  );
                })}
              </section>

              <div className="vessel-fleet-pagination-bar">
                <Pagination
                  page={safeCurrentPage}
                  totalPages={totalPages}
                  totalItems={totalElements}
                  pageSize={pageSize}
                  itemLabel="embarcações"
                  disabled={isLoading}
                  onPageChange={(page) => {
                    startListingRequest();
                    setCurrentPage(page);
                  }}
                />
              </div>
            </>
          )}

        {/* Listagem em Tabela com Paginação integrada no rodapé (Figma N · 02 #5932:31796) */}
        {!errorMessage &&
          (isLoading || vessels.length > 0) &&
          viewMode === "list" && (
            <section
              className="vessel-fleet-table-card"
              aria-label="Tabela de embarcações"
            >
              <DataTable<VesselSummaryDTO>
                columns={tableColumns}
                data={vessels}
                loading={isLoading}
                skeletonRows={6}
                rowKey={(vessel) => vessel.idVessel}
                pagination={{
                  page: safeCurrentPage,
                  totalPages,
                  totalItems: totalElements,
                  pageSize,
                  itemLabel: "embarcações",
                  disabled: isLoading,
                  onPageChange: (page) => {
                    startListingRequest();
                    setCurrentPage(page);
                  },
                }}
              />
            </section>
          )}
      </div>
    </div>
  );
}
