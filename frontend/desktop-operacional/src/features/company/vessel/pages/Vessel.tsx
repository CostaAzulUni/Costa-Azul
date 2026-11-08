import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  DataTable,
  EmptyState,
  FilterChip,
  IconButton,
  Input,
  KPI,
  Pagination,
  Select,
  VesselCard,
  type DataTableColumn,
  type SelectOption,
} from "../../../../components";
import {
  listVessels,
  type VesselResponseDTO,
} from "../../../../services/vesselcreate";
import { formatMetric } from "../vesselFormConfig";
import {
  evaluateVesselCompliance,
  formatClassificationDisplay,
  getVesselBasePortDisplay,
  getVesselStatusDisplay,
  resolveSafeVesselPhotoUrl,
  VESSEL_COMPLIANCE_FILTER_OPTIONS,
  VESSEL_STATUS_FILTER_OPTIONS,
  type VesselComplianceFilterValue,
  type VesselStatusFilterValue,
} from "../vesselListingUtils";
import "./Vessel.css";

type FleetViewMode = "grid" | "list";

const PAGE_SIZE_GRID = 6;
const PAGE_SIZE_LIST = 10;

export function Vessel() {
  const navigate = useNavigate();

  const [vessels, setVessels] = useState<VesselResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Controles de busca, filtros e visualização (Figma #5932:31730)
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] =
    useState<VesselStatusFilterValue>("ALL");
  const [basePortFilter, setBasePortFilter] = useState<string>("ALL");
  const [complianceFilter, setComplianceFilter] =
    useState<VesselComplianceFilterValue>("ALL");
  const [viewMode, setViewMode] = useState<FleetViewMode>("grid");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const parseFleetError = (error: unknown): string => {
    let message =
      "Não foi possível carregar a listagem de embarcações. Verifique sua conexão com o servidor.";
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        message =
          "Sua sessão expirou ou você não possui permissão para consultar as embarcações.";
      } else if (
        typeof error.response?.data === "object" &&
        error.response?.data !== null &&
        "message" in error.response.data &&
        typeof (error.response.data as { message?: unknown }).message ===
          "string"
      ) {
        message = (error.response.data as { message: string }).message;
      }
    }
    return message;
  };

  const fetchFleet = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await listVessels();
      setVessels(Array.isArray(response) ? response : []);
    } catch (error: unknown) {
      setErrorMessage(parseFleetError(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    listVessels()
      .then((response) => {
        if (!cancelled) {
          setVessels(Array.isArray(response) ? response : []);
          setErrorMessage(null);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setErrorMessage(parseFleetError(error));
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
  }, []);

  // Opções dinâmicas de Porto Base extraídas dos dados reais cadastrados
  const basePortOptions = useMemo<SelectOption[]>(() => {
    const uniquePorts = new Set<string>();
    vessels.forEach((vessel) => {
      const portLabel = getVesselBasePortDisplay(vessel);
      if (portLabel !== "—") {
        uniquePorts.add(portLabel);
      }
    });

    const sortedPorts = Array.from(uniquePorts).sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );

    return [
      { label: "Todos", value: "ALL" },
      ...sortedPorts.map((port) => ({ label: port, value: port })),
    ];
  }, [vessels]);

  // Cálculo dos KPIs reais da frota (Figma #5932:31702)
  const fleetKpis = useMemo(() => {
    const totalCount = vessels.length;
    let activeCount = 0;
    let maintenanceCount = 0;
    let inactiveCount = 0;
    let totalPassengerCapacity = 0;
    let expiredCertificatesCount = 0;
    let expiringSoonCertificatesCount = 0;

    vessels.forEach((vessel) => {
      const status = (vessel.operationalStatus ?? "").trim().toUpperCase();
      if (status === "ACTIVE") {
        activeCount += 1;
      } else if (status === "MAINTENANCE" || status === "DRY_DOCK") {
        maintenanceCount += 1;
      } else {
        inactiveCount += 1;
      }

      if (
        vessel.maxPassengerCapacity !== null &&
        !Number.isNaN(vessel.maxPassengerCapacity)
      ) {
        totalPassengerCapacity += vessel.maxPassengerCapacity;
      }

      const compliance = evaluateVesselCompliance(vessel.certificateExpiryDate);
      if (compliance.state === "expired") {
        expiredCertificatesCount += 1;
      } else if (compliance.state === "expiring_soon") {
        expiringSoonCertificatesCount += 1;
      }
    });

    const totalComplianceAlerts =
      expiredCertificatesCount + expiringSoonCertificatesCount;

    return {
      totalCount,
      activeCount,
      maintenanceCount,
      inactiveCount,
      totalPassengerCapacity,
      expiredCertificatesCount,
      expiringSoonCertificatesCount,
      totalComplianceAlerts,
    };
  }, [vessels]);

  // Filtragem real das embarcações no cliente
  const filteredVessels = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return vessels.filter((vessel) => {
      if (normalizedQuery) {
        const matchesName = (vessel.vesselName ?? "")
          .toLowerCase()
          .includes(normalizedQuery);
        const matchesImo = (vessel.imoNumber ?? "")
          .toLowerCase()
          .includes(normalizedQuery);
        const matchesRegistration = (vessel.nationalRegistrationNumber ?? "")
          .toLowerCase()
          .includes(normalizedQuery);
        const matchesCompany = (vessel.companyName ?? "")
          .toLowerCase()
          .includes(normalizedQuery);

        if (
          !matchesName &&
          !matchesImo &&
          !matchesRegistration &&
          !matchesCompany
        ) {
          return false;
        }
      }

      if (statusFilter !== "ALL") {
        const vesselStatus = (vessel.operationalStatus ?? "")
          .trim()
          .toUpperCase();
        if (vesselStatus !== statusFilter) {
          return false;
        }
      }

      if (basePortFilter !== "ALL") {
        const vesselPort = getVesselBasePortDisplay(vessel);
        if (vesselPort !== basePortFilter) {
          return false;
        }
      }

      if (complianceFilter !== "ALL") {
        const compliance = evaluateVesselCompliance(
          vessel.certificateExpiryDate
        );
        if (compliance.state !== complianceFilter) {
          return false;
        }
      }

      return true;
    });
  }, [vessels, searchQuery, statusFilter, basePortFilter, complianceFilter]);

  const pageSize = viewMode === "grid" ? PAGE_SIZE_GRID : PAGE_SIZE_LIST;
  const totalPages = Math.max(1, Math.ceil(filteredVessels.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedVessels = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredVessels.slice(startIndex, startIndex + pageSize);
  }, [filteredVessels, safeCurrentPage, pageSize]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    statusFilter !== "ALL" ||
    basePortFilter !== "ALL" ||
    complianceFilter !== "ALL";

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setBasePortFilter("ALL");
    setComplianceFilter("ALL");
    setCurrentPage(1);
  };

  const handleOpenVessel = useCallback(
    (vessel: VesselResponseDTO) => {
      navigate(`/vessel/${vessel.idVessel}`, { state: { vessel } });
    },
    [navigate]
  );

  // Colunas da visualização em Lista (Figma N · 02 #5932:31796)
  const tableColumns = useMemo<DataTableColumn<VesselResponseDTO>[]>(
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
        width: "160px",
        render: (vessel) => (
          <span className="vessel-table-port">
            {getVesselBasePortDisplay(vessel)}
          </span>
        ),
      },
      {
        key: "compliance",
        header: "Conformidade",
        width: "190px",
        render: (vessel) => {
          const compliance = evaluateVesselCompliance(
            vessel.certificateExpiryDate
          );
          return (
            <div
              className={`vessel-table-compliance vessel-table-compliance--${compliance.cardTone}`}
            >
              <i
                className={`pi ${
                  compliance.cardTone === "ok"
                    ? "pi-check-circle"
                    : "pi-exclamation-triangle"
                }`}
                aria-hidden="true"
              />
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
        width: "84px",
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

  return (
    <div className="vessel-fleet-page">
      <div className="vessel-fleet-container">
        {/* Cabeçalho da página (Figma #5932:31687) */}
        <header className="vessel-fleet-header">
          <div className="vessel-fleet-header__left">
            <Breadcrumb
              items={[{ label: "Frota e Viagens" }, { label: "Navios" }]}
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
              onClick={() => void fetchFleet()}
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
            value={isLoading ? "—" : String(fleetKpis.activeCount)}
            highlightText={
              !isLoading ? `de ${fleetKpis.totalCount} na frota` : undefined
            }
            highlightTone="neutral"
            detailText={
              isLoading
                ? "Carregando frota..."
                : `${fleetKpis.maintenanceCount} em manutenção · ${fleetKpis.inactiveCount} fora de serviço`
            }
          />

          <KPI
            label="Viagens em curso"
            icon="pi-send"
            value="—"
            detailText="Módulo de viagens ainda não integrado à API"
          />

          <KPI
            label="Passageiros a bordo"
            icon="pi-users"
            value="—"
            highlightText={
              !isLoading && fleetKpis.totalPassengerCapacity > 0
                ? `Cap. frota: ${fleetKpis.totalPassengerCapacity.toLocaleString("pt-BR")}`
                : undefined
            }
            highlightTone="neutral"
            detailText="Embarque em tempo real indisponível no backend"
          />

          <KPI
            label="Alertas de conformidade"
            icon="pi-shield"
            value={isLoading ? "—" : String(fleetKpis.totalComplianceAlerts)}
            highlightText={
              !isLoading
                ? fleetKpis.totalComplianceAlerts > 0
                  ? `${fleetKpis.expiredCertificatesCount} vencido(s) · ${fleetKpis.expiringSoonCertificatesCount} vence(m) em até 30d`
                  : "Conformidade em dia"
                : undefined
            }
            highlightTone={
              fleetKpis.totalComplianceAlerts > 0 ? "warning" : "success"
            }
            detailText="Monitoramento da validade do certificado ISM"
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
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Buscar embarcação por nome, IMO ou registro"
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
                  setViewMode("grid");
                  setCurrentPage(1);
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
                  setViewMode("list");
                  setCurrentPage(1);
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
                      setSearchQuery("");
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
            onAction={() => void fetchFleet()}
          />
        )}

        {/* Estado de Carregamento */}
        {isLoading && !errorMessage && (
          <div className="vessel-fleet-loading" role="status" aria-live="polite">
            <i className="pi pi-spin pi-spinner" aria-hidden="true" />
            <span>Carregando embarcações cadastradas...</span>
          </div>
        )}

        {/* Estado Vazio: nenhuma embarcação cadastrada no banco */}
        {!isLoading && !errorMessage && vessels.length === 0 && (
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
        {!isLoading &&
          !errorMessage &&
          vessels.length > 0 &&
          filteredVessels.length === 0 && (
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
          filteredVessels.length > 0 &&
          viewMode === "grid" && (
            <section
              className="vessel-fleet-grid"
              aria-label="Grade de embarcações"
            >
              {paginatedVessels.map((vessel) => {
                const status = getVesselStatusDisplay(vessel.operationalStatus);
                const compliance = evaluateVesselCompliance(
                  vessel.certificateExpiryDate
                );
                const basePort = getVesselBasePortDisplay(vessel);
                const societyLabel = formatClassificationDisplay(
                  vessel.classificationSociety
                );

                const idleDetails = [
                  basePort !== "—" ? `Base: ${basePort}` : null,
                  societyLabel !== "—" ? `Classe: ${societyLabel}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ");

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
                        idleDetails ||
                        `Sem viagem ativa · Registro: ${vessel.nationalRegistrationNumber || "—"}`,
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
          )}

        {/* Listagem em Tabela (Figma N · 02 #5932:31796) */}
        {!isLoading &&
          !errorMessage &&
          filteredVessels.length > 0 &&
          viewMode === "list" && (
            <section
              className="vessel-fleet-table-card"
              aria-label="Tabela de embarcações"
            >
              <DataTable<VesselResponseDTO>
                columns={tableColumns}
                data={paginatedVessels}
                rowKey={(vessel) => vessel.idVessel}
              />
            </section>
          )}

        {/* Paginação (Figma #5932:31786) */}
        {!isLoading && !errorMessage && filteredVessels.length > 0 && (
          <Pagination
            page={safeCurrentPage}
            totalPages={totalPages}
            totalItems={filteredVessels.length}
            pageSize={pageSize}
            itemLabel="embarcações"
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
    </div>
  );
}
