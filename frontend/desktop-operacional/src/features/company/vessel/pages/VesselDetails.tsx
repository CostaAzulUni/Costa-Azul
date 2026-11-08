import { useEffect, useId, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Alert,
  Badge,
  Button,
  DataTable,
  EmptyState,
  FilterChip,
  KPI,
  SectionCard,
  TabPanel,
  VesselHeader,
  type BadgeTone,
  type DataTableColumn,
  type TabItem,
} from "../../../../components";
import {
  listVessels,
  type VesselResponseDTO,
} from "../../../../services/vesselcreate";
import { formatMetric } from "../vesselFormConfig";
import {
  evaluateVesselCompliance,
  evaluateVesselProfileReadiness,
  formatClassificationDisplay,
  formatDateTimeBr,
  formatFlagDisplay,
  formatPropulsionDisplay,
  getVesselBasePortDisplay,
  getVesselStatusDisplay,
  resolveSafeVesselPhotoUrl,
} from "../vesselListingUtils";
import "./VesselDetails.css";

interface VesselLocationState {
  vessel?: VesselResponseDTO;
}

interface StatutoryCertificateRow {
  id: string;
  certificateName: string;
  code: string;
  issuer: string;
  expiryFormatted: string;
  statusLabel: string;
  badgeTone: BadgeTone;
  hasAlert: boolean;
}

type CertificateFilterType = "ALL" | "ALERT" | "VALID";
type TripFilterType = "ALL" | "SCHEDULED" | "COMPLETED";

interface PrototypeSectionSummary {
  code: string;
  tabId: string;
  title: string;
  description: string;
  badgeText: string;
}

export function VesselDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const tabsIdPrefix = useId();
  const routeState = location.state as VesselLocationState | null;

  const [fetchedVessel, setFetchedVessel] = useState<VesselResponseDTO | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const hasMatchingState = Boolean(
      routeState?.vessel && (!id || routeState.vessel.idVessel === id)
    );
    return !hasMatchingState && Boolean(id);
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(() =>
    id ? null : "Identificador da embarcação não informado na rota."
  );

  const vessel = useMemo<VesselResponseDTO | null>(() => {
    if (routeState?.vessel && (!id || routeState.vessel.idVessel === id)) {
      return routeState.vessel;
    }
    if (fetchedVessel && (!id || fetchedVessel.idVessel === id)) {
      return fetchedVessel;
    }
    return null;
  }, [routeState?.vessel, fetchedVessel, id]);

  const [activeTab, setActiveTab] = useState<string>("visao-geral");
  const [showSectionIndex, setShowSectionIndex] = useState<boolean>(false);
  const [certificateFilter, setCertificateFilter] =
    useState<CertificateFilterType>("ALL");
  const [tripFilter, setTripFilter] = useState<TripFilterType>("ALL");

  useEffect(() => {
    if (!id || vessel) {
      return;
    }

    let cancelled = false;

    listVessels()
      .then((allVessels) => {
        if (cancelled) return;
        const found = (Array.isArray(allVessels) ? allVessels : []).find(
          (item) => item.idVessel === id
        );
        if (found) {
          setFetchedVessel(found);
          setErrorMessage(null);
        } else {
          setFetchedVessel(null);
          setErrorMessage(
            "A embarcação solicitada não foi encontrada na frota da sua empresa."
          );
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        let message =
          "Não foi possível carregar os dados da embarcação. Verifique sua conexão.";
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 401 || status === 403) {
            message =
              "Sua sessão expirou ou você não tem permissão para visualizar esta embarcação.";
          }
        }
        setErrorMessage(message);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, vessel]);

  const statusDisplay = useMemo(
    () => getVesselStatusDisplay(vessel?.operationalStatus),
    [vessel?.operationalStatus]
  );

  const compliance = useMemo(
    () => evaluateVesselCompliance(vessel?.certificateExpiryDate),
    [vessel?.certificateExpiryDate]
  );

  const readiness = useMemo(
    () => (vessel ? evaluateVesselProfileReadiness(vessel) : null),
    [vessel]
  );

  // Abas da ficha da embarcação (Figma #5932:33231 — E · 01 a E · 08)
  const detailTabs = useMemo<TabItem[]>(() => {
    const deckCount = vessel?.deckCount ?? 0;
    const certCount = vessel?.ismCertification ? 1 : 0;
    const hasCertAlert =
      compliance.state === "expired" || compliance.state === "expiring_soon";

    return [
      { id: "visao-geral", label: "Visão geral" },
      { id: "especificacoes", label: "Especificações" },
      { id: "capacidade", label: "Capacidade" },
      {
        id: "conveses-areas",
        label: "Conveses & áreas",
        count: deckCount,
      },
      {
        id: "certificacoes",
        label: "Certificações",
        count: certCount,
        countTone: hasCertAlert ? "warning" : "neutral",
      },
      { id: "documentos", label: "Documentos" },
      { id: "viagens", label: "Viagens" },
      { id: "historico", label: "Histórico" },
    ];
  }, [vessel?.deckCount, vessel?.ismCertification, compliance.state]);

  // Índice rápido das 8 seções (Figma E · 00 #5932:33232)
  const sectionSummaries = useMemo<PrototypeSectionSummary[]>(() => {
    if (!vessel) return [];
    return [
      {
        code: "01",
        tabId: "visao-geral",
        title: "Visão geral",
        description:
          "Identificação oficial, base operacional, alertas de conformidade e prontidão do cadastro.",
        badgeText: statusDisplay.label,
      },
      {
        code: "02",
        tabId: "especificacoes",
        title: "Especificações",
        description:
          "Dimensões (LOA, boca, calado), tonelagem (GT, DWT), construção, propulsão e relações de projeto.",
        badgeText: formatMetric(vessel.grossTonnage, "GT", 0),
      },
      {
        code: "03",
        tabId: "capacidade",
        title: "Capacidade",
        description:
          "Lotação máxima de passageiros e tripulantes, total de cabines e cobertura SOLAS de salvatagem.",
        badgeText: `${formatMetric(vessel.maxPassengerCapacity)} pass.`,
      },
      {
        code: "04",
        tabId: "conveses-areas",
        title: "Conveses & áreas",
        description:
          "Estrutura de conveses, cabines e áreas comuns/serviço calculadas pelo sistema.",
        badgeText: `${vessel.deckCount ?? 0} conveses`,
      },
      {
        code: "05",
        tabId: "certificacoes",
        title: "Certificações",
        description:
          "Sociedade classificadora (IACS), certificado Código ISM e controle de validade.",
        badgeText: compliance.shortLabel,
      },
      {
        code: "06",
        tabId: "documentos",
        title: "Documentos",
        description:
          "Repositório de documentação técnica e plantas vinculadas à embarcação.",
        badgeText: "Consulta",
      },
      {
        code: "07",
        tabId: "viagens",
        title: "Viagens",
        description:
          "Programação de escalas, viagens em andamento e histórico de travessias.",
        badgeText: "0 viagens",
      },
      {
        code: "08",
        tabId: "historico",
        title: "Histórico",
        description:
          "Trilha de auditoria com data de cadastro e eventos registrados no sistema.",
        badgeText: formatDateTimeBr(vessel.createdAt).split(",")[0] || "Ativo",
      },
    ];
  }, [vessel, statusDisplay.label, compliance.shortLabel]);

  // Linha real de certificado ISM para a tabela da Aba 05 (E · 05)
  const certificateRows = useMemo<StatutoryCertificateRow[]>(() => {
    if (!vessel || !vessel.ismCertification?.trim()) return [];
    const hasAlert =
      compliance.state === "expired" ||
      compliance.state === "expiring_soon" ||
      compliance.state === "missing";

    return [
      {
        id: `ism-${vessel.idVessel}`,
        certificateName: "Certificado de Gestão de Segurança (Código ISM)",
        code: vessel.ismCertification,
        issuer: formatClassificationDisplay(vessel.classificationSociety),
        expiryFormatted: compliance.expiryFormatted,
        statusLabel: compliance.shortLabel,
        badgeTone: compliance.badgeTone,
        hasAlert,
      },
    ];
  }, [vessel, compliance]);

  const filteredCertificateRows = useMemo(() => {
    if (certificateFilter === "ALERT") {
      return certificateRows.filter((row) => row.hasAlert);
    }
    if (certificateFilter === "VALID") {
      return certificateRows.filter((row) => !row.hasAlert);
    }
    return certificateRows;
  }, [certificateRows, certificateFilter]);

  const certificateColumns = useMemo<
    DataTableColumn<StatutoryCertificateRow>[]
  >(
    () => [
      {
        key: "certificateName",
        header: "Certificado",
        render: (row) => (
          <div className="vessel-details-cert-cell">
            <span className="vessel-details-cert-cell__title">
              {row.certificateName}
            </span>
            <span className="vessel-details-cert-cell__code">
              Código: {row.code}
            </span>
          </div>
        ),
      },
      {
        key: "issuer",
        header: "Órgão / Classificadora",
        width: "240px",
        render: (row) => <span>{row.issuer}</span>,
      },
      {
        key: "expiry",
        header: "Validade",
        width: "150px",
        render: (row) => (
          <span className="vessel-details-tabular">{row.expiryFormatted}</span>
        ),
      },
      {
        key: "status",
        header: "Situação",
        width: "190px",
        render: (row) => (
          <Badge tone={row.badgeTone} dot>
            {row.statusLabel}
          </Badge>
        ),
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <div className="vessel-details-page">
        <div className="vessel-details-state-box" role="status">
          <i className="pi pi-spin pi-spinner" aria-hidden="true" />
          <span>Carregando ficha da embarcação...</span>
        </div>
      </div>
    );
  }

  if (errorMessage || !vessel) {
    return (
      <div className="vessel-details-page">
        <div className="vessel-details-error-container">
          <Alert
            variant="error"
            title="Embarcação indisponível"
            description={
              errorMessage ?? "Não foi possível localizar a embarcação."
            }
            actionLabel="Voltar para Navios"
            onAction={() => navigate("/vessel")}
          />
        </div>
      </div>
    );
  }

  // Cálculos reais para Especificações (E · 02) e Capacidade (E · 03)
  const loaBeamRatio =
    vessel.lengthOverall &&
    vessel.maxBeam &&
    vessel.lengthOverall > 0 &&
    vessel.maxBeam > 0
      ? `${(vessel.lengthOverall / vessel.maxBeam).toLocaleString("pt-BR", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })} : 1`
      : "—";

  const gtPerPassenger =
    vessel.grossTonnage &&
    vessel.maxPassengerCapacity &&
    vessel.grossTonnage > 0 &&
    vessel.maxPassengerCapacity > 0
      ? `${(vessel.grossTonnage / vessel.maxPassengerCapacity).toLocaleString(
          "pt-BR",
          {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }
        )} GT/pass.`
      : "—";

  const currentYear = new Date().getFullYear();
  const vesselAgeText =
    vessel.yearBuilt && vessel.yearBuilt <= currentYear
      ? `${currentYear - vessel.yearBuilt} ${
          currentYear - vessel.yearBuilt === 1 ? "ano" : "anos"
        } (construída em ${vessel.yearBuilt})`
      : vessel.yearBuilt
        ? `Ano ${vessel.yearBuilt}`
        : "—";

  const totalAboard =
    (vessel.maxPassengerCapacity ?? 0) + (vessel.maxCrewCapacity ?? 0);
  const lifeboatCap = vessel.lifeboatTotalCapacity ?? 0;
  const lifeboatCoveragePct =
    totalAboard > 0 && lifeboatCap > 0
      ? Math.round((lifeboatCap / totalAboard) * 100)
      : null;

  return (
    <div className="vessel-details-page">
      {/* Cabeçalho Object Page compartilhado entre todas as abas (Figma #5932:33344) */}
      <VesselHeader
        breadcrumb={[
          { label: "Frota e Viagens", to: "/vessel" },
          { label: "Navios", to: "/vessel" },
          { label: vessel.vesselName },
        ]}
        name={vessel.vesselName}
        photoUrl={resolveSafeVesselPhotoUrl(vessel.photoUrl)}
        badges={[
          {
            label: statusDisplay.label,
            tone: statusDisplay.tone,
          },
        ]}
        meta={[
          {
            icon: "pi-id-card",
            label: `Registro ${vessel.nationalRegistrationNumber || "—"}`,
          },
          {
            icon: "pi-flag",
            label: formatFlagDisplay(vessel.flag),
          },
          {
            icon: "pi-globe",
            label: `IMO ${vessel.imoNumber || "—"}`,
          },
          {
            icon: "pi-building",
            label: vessel.companyName || "Empresa não informada",
          },
        ]}
        keyMetrics={[
          {
            label: "Arqueação bruta",
            value: formatMetric(vessel.grossTonnage, "GT", 2),
          },
          {
            label: "Comprimento",
            value: formatMetric(vessel.lengthOverall, "m", 2),
          },
          {
            label: "Conveses",
            value: String(vessel.deckCount ?? 0),
          },
          {
            label: "Passageiros",
            value: formatMetric(vessel.maxPassengerCapacity),
          },
          {
            label: "Tripulação",
            value: formatMetric(vessel.maxCrewCapacity),
          },
          {
            label: "Porto base",
            value: getVesselBasePortDisplay(vessel),
          },
        ]}
        actions={
          <div className="vessel-details-header-actions">
            <Button
              type="button"
              variant="ghost"
              size="md"
              icon="pi-th-large"
              onClick={() => setShowSectionIndex((prev) => !prev)}
            >
              {showSectionIndex ? "Ocultar índice" : "Índice das abas"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              icon="pi-arrow-left"
              onClick={() => navigate("/vessel")}
            >
              Voltar para navios
            </Button>
          </div>
        }
        tabs={{
          items: detailTabs,
          activeId: activeTab,
          onChange: (tabId) => setActiveTab(tabId),
          idPrefix: tabsIdPrefix,
        }}
      />

      <div className="vessel-details-body">
        {/* Painel E · 00 · Índice das 8 seções da ficha (Figma #5932:33232) */}
        {showSectionIndex && (
          <section
            className="vessel-details-index-card"
            aria-label="Índice rápido das seções da embarcação"
          >
            <div className="vessel-details-index-card__header">
              <div>
                <span className="vessel-details-index-card__eyebrow">
                  ÍNDICE DE NAVEGAÇÃO DA FICHA
                </span>
                <h2 className="vessel-details-index-card__title">
                  Seções da página de detalhe ({vessel.vesselName})
                </h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon="pi-times"
                onClick={() => setShowSectionIndex(false)}
              >
                Fechar
              </Button>
            </div>

            <div className="vessel-details-index-grid">
              {sectionSummaries.map((item) => {
                const isCurrent = activeTab === item.tabId;
                return (
                  <button
                    key={item.tabId}
                    type="button"
                    className={`vessel-details-index-item ${
                      isCurrent ? "vessel-details-index-item--active" : ""
                    }`}
                    onClick={() => {
                      setActiveTab(item.tabId);
                      setShowSectionIndex(false);
                    }}
                  >
                    <div className="vessel-details-index-item__top">
                      <span className="vessel-details-index-item__num">
                        {item.code}
                      </span>
                      <Badge
                        tone={isCurrent ? "info" : "neutral"}
                        size="sm"
                      >
                        {item.badgeText}
                      </Badge>
                    </div>
                    <strong className="vessel-details-index-item__title">
                      {item.title}
                    </strong>
                    <span className="vessel-details-index-item__desc">
                      {item.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ====================================================================
            ABA 01 · VISÃO GERAL (Figma E · 01 #5932:33339)
            ==================================================================== */}
        {activeTab === "visao-geral" && (
          <TabPanel idPrefix={tabsIdPrefix} tabId="visao-geral">
            <div className="vessel-details-tab-stack">
              {(compliance.state === "expired" ||
                compliance.state === "expiring_soon") && (
                <Alert
                  variant={compliance.state === "expired" ? "error" : "warning"}
                  title={
                    compliance.state === "expired"
                      ? `Certificado Código ISM vencido (${compliance.expiryFormatted})`
                      : `Certificado Código ISM vence em breve (${compliance.expiryFormatted})`
                  }
                  description={`Certificação ISM (${vessel.ismCertification || "—"}) emitida por ${formatClassificationDisplay(
                    vessel.classificationSociety
                  )}. Verifique a aba de Certificações para acompanhar a regularização.`}
                  actionLabel="Ver certificações"
                  onAction={() => setActiveTab("certificacoes")}
                />
              )}

              <div className="vessel-details-layout-grid">
                <div className="vessel-details-main-col">
                  <SectionCard
                    title="Informações básicas"
                    icon="pi-compass"
                    subtitle="Identificação oficial e registro marítimo da embarcação."
                  >
                    <dl className="vessel-details-dl-grid">
                      <div className="vessel-details-dl-item">
                        <dt>Nome da embarcação</dt>
                        <dd>{vessel.vesselName || "—"}</dd>
                      </div>
                      <div className="vessel-details-dl-item">
                        <dt>Número de registro nacional</dt>
                        <dd className="vessel-details-tabular">
                          {vessel.nationalRegistrationNumber || "—"}
                        </dd>
                      </div>
                      <div className="vessel-details-dl-item">
                        <dt>Número IMO</dt>
                        <dd className="vessel-details-tabular">
                          {vessel.imoNumber || "—"}
                        </dd>
                      </div>
                      <div className="vessel-details-dl-item">
                        <dt>Bandeira</dt>
                        <dd>{formatFlagDisplay(vessel.flag)}</dd>
                      </div>
                      <div className="vessel-details-dl-item">
                        <dt>Ano de fabricação</dt>
                        <dd className="vessel-details-tabular">
                          {vessel.yearBuilt ?? "—"}
                        </dd>
                      </div>
                      <div className="vessel-details-dl-item">
                        <dt>
                          <span>Empresa proprietária</span>
                          <Badge tone="automatic" size="sm">
                            Automático
                          </Badge>
                        </dt>
                        <dd>{vessel.companyName || "—"}</dd>
                      </div>
                      <div className="vessel-details-dl-item">
                        <dt>Data de cadastro</dt>
                        <dd className="vessel-details-tabular">
                          {formatDateTimeBr(vessel.createdAt)}
                        </dd>
                      </div>
                      <div className="vessel-details-dl-item">
                        <dt>ID interno da embarcação</dt>
                        <dd className="vessel-details-mono">
                          {vessel.idVessel || "—"}
                        </dd>
                      </div>
                    </dl>
                  </SectionCard>

                  <SectionCard
                    title="Base operacional & gestão"
                    icon="pi-map-marker"
                    subtitle="Alocação portuária, terminal de referência e contato operacional."
                  >
                    <dl className="vessel-details-dl-grid">
                      <div className="vessel-details-dl-item">
                        <dt>Terminal principal</dt>
                        <dd>{vessel.mainTerminal || "Não informado"}</dd>
                      </div>
                      <div className="vessel-details-dl-item">
                        <dt>Porto base (UUID)</dt>
                        <dd className="vessel-details-mono">
                          {vessel.idHomePort || "Não informado"}
                        </dd>
                      </div>
                      <div className="vessel-details-dl-item">
                        <dt>Gerente responsável (UUID)</dt>
                        <dd className="vessel-details-mono">
                          {vessel.idManager || "Não informado"}
                        </dd>
                      </div>
                      <div className="vessel-details-dl-item">
                        <dt>E-mail operacional</dt>
                        <dd>{vessel.operationalEmail || "—"}</dd>
                      </div>
                    </dl>
                  </SectionCard>
                </div>

                <aside className="vessel-details-side-col">
                  <SectionCard title="Viagem em andamento" icon="pi-send">
                    <div className="vessel-details-side-placeholder">
                      <div className="vessel-details-side-placeholder__badge">
                        <Badge tone="neutral" dot>
                          Sem viagem ativa
                        </Badge>
                      </div>
                      <p className="vessel-details-side-placeholder__text">
                        Não há viagem em curso registrada para esta embarcação.
                        O módulo de programação de viagens ainda não está
                        integrado à API de navios.
                      </p>
                    </div>
                  </SectionCard>

                  <SectionCard title="Conformidade" icon="pi-shield">
                    <div className="vessel-details-kv-list">
                      <div className="vessel-details-kv-row">
                        <span>Certificados válidos</span>
                        <strong className="vessel-details-tabular">
                          {compliance.state === "valid" ? "1" : "0"}
                        </strong>
                      </div>
                      <div className="vessel-details-kv-row">
                        <span>Vencem em até 30 dias</span>
                        <strong className="vessel-details-tabular">
                          {compliance.state === "expiring_soon" ? "1" : "0"}
                        </strong>
                      </div>
                      <div className="vessel-details-kv-row">
                        <span>Vencidos</span>
                        <strong className="vessel-details-tabular">
                          {compliance.state === "expired" ? "1" : "0"}
                        </strong>
                      </div>
                      <div className="vessel-details-kv-row">
                        <span>Classificadora (IACS)</span>
                        <strong>
                          {formatClassificationDisplay(
                            vessel.classificationSociety
                          )}
                        </strong>
                      </div>
                    </div>
                    <div className="vessel-details-side-footer">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        icon="pi-arrow-right"
                        iconPosition="right"
                        onClick={() => setActiveTab("certificacoes")}
                      >
                        Ver certificações
                      </Button>
                    </div>
                  </SectionCard>

                  {readiness && (
                    <SectionCard
                      title="Prontidão do cadastro"
                      icon="pi-check-circle"
                    >
                      <div className="vessel-details-readiness">
                        <div className="vessel-details-readiness__top">
                          <span>
                            {readiness.completedCount} de {readiness.totalCount}{" "}
                            etapas completas
                          </span>
                          <strong className="vessel-details-tabular">
                            {readiness.percentage}%
                          </strong>
                        </div>
                        <div
                          className="vessel-details-progress-track"
                          role="progressbar"
                          aria-valuenow={readiness.percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            className="vessel-details-progress-fill"
                            style={{ width: `${readiness.percentage}%` }}
                          />
                        </div>

                        <ul className="vessel-details-readiness__list">
                          {readiness.items.map((item) => (
                            <li key={item.id}>
                              <button
                                type="button"
                                className="vessel-details-readiness__item"
                                onClick={() => setActiveTab(item.targetTab)}
                              >
                                <i
                                  className={`pi ${
                                    item.completed
                                      ? "pi-check-circle vessel-details-readiness__icon--ok"
                                      : "pi-clock vessel-details-readiness__icon--pending"
                                  }`}
                                  aria-hidden="true"
                                />
                                <div className="vessel-details-readiness__texts">
                                  <span>{item.label}</span>
                                  <small>{item.detail}</small>
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </SectionCard>
                  )}
                </aside>
              </div>
            </div>
          </TabPanel>
        )}

        {/* ====================================================================
            ABA 02 · ESPECIFICAÇÕES (Figma E · 02 #5932:33464)
            ==================================================================== */}
        {activeTab === "especificacoes" && (
          <TabPanel idPrefix={tabsIdPrefix} tabId="especificacoes">
            <div className="vessel-details-layout-grid">
              <div className="vessel-details-main-col">
                <SectionCard
                  title="Dimensões e tonelagem"
                  icon="pi-arrows-h"
                  subtitle="Medidas estruturais do casco e arqueação oficial."
                >
                  <dl className="vessel-details-dl-grid">
                    <div className="vessel-details-dl-item">
                      <dt>Comprimento total (LOA)</dt>
                      <dd className="vessel-details-tabular">
                        {formatMetric(vessel.lengthOverall, "m", 2)}
                      </dd>
                    </div>
                    <div className="vessel-details-dl-item">
                      <dt>Boca máxima</dt>
                      <dd className="vessel-details-tabular">
                        {formatMetric(vessel.maxBeam, "m", 2)}
                      </dd>
                    </div>
                    <div className="vessel-details-dl-item">
                      <dt>Calado operacional</dt>
                      <dd className="vessel-details-tabular">
                        {formatMetric(vessel.operatingDraft, "m", 2)}
                      </dd>
                    </div>
                    <div className="vessel-details-dl-item">
                      <dt>Arqueação bruta (GT)</dt>
                      <dd className="vessel-details-tabular">
                        {formatMetric(vessel.grossTonnage, "GT", 2)}
                      </dd>
                    </div>
                    <div className="vessel-details-dl-item">
                      <dt>Porte bruto (DWT)</dt>
                      <dd className="vessel-details-tabular">
                        {formatMetric(vessel.deadweightTonnage, "t", 2)}
                      </dd>
                    </div>
                  </dl>
                </SectionCard>

                <SectionCard
                  title="Construção e propulsão"
                  icon="pi-wrench"
                  subtitle="Dados do estaleiro construtor e sistema propulsor principal."
                >
                  <dl className="vessel-details-dl-grid">
                    <div className="vessel-details-dl-item">
                      <dt>Estaleiro construtor</dt>
                      <dd>{vessel.shipyard || "—"}</dd>
                    </div>
                    <div className="vessel-details-dl-item">
                      <dt>Propulsão principal</dt>
                      <dd>{formatPropulsionDisplay(vessel.mainPropulsion)}</dd>
                    </div>
                    <div className="vessel-details-dl-item">
                      <dt>Velocidade máx. de serviço</dt>
                      <dd className="vessel-details-tabular">
                        {formatMetric(vessel.maxServiceSpeed, "nós", 1)}
                      </dd>
                    </div>
                    <div className="vessel-details-dl-item">
                      <dt>Ano de fabricação</dt>
                      <dd className="vessel-details-tabular">
                        {vessel.yearBuilt ?? "—"}
                      </dd>
                    </div>
                  </dl>
                </SectionCard>
              </div>

              <aside className="vessel-details-side-col">
                <SectionCard title="Calculado pelo sistema" icon="pi-sitemap">
                  <div className="vessel-details-kv-list">
                    <div className="vessel-details-kv-row">
                      <span className="vessel-details-kv-row__with-badge">
                        Número de conveses
                        <Badge tone="automatic" size="sm">
                          Automático
                        </Badge>
                      </span>
                      <strong className="vessel-details-tabular">
                        {vessel.deckCount ?? 0}
                      </strong>
                    </div>
                    <div className="vessel-details-kv-row">
                      <span className="vessel-details-kv-row__with-badge">
                        Total de áreas
                        <Badge tone="automatic" size="sm">
                          Automático
                        </Badge>
                      </span>
                      <strong className="vessel-details-tabular">
                        {vessel.totalAreas ?? 0}
                      </strong>
                    </div>
                  </div>
                  <p className="vessel-details-side-note">
                    Atualizados automaticamente a partir dos conveses e áreas
                    cadastradas na embarcação.
                  </p>
                  <div className="vessel-details-side-footer">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon="pi-arrow-right"
                      iconPosition="right"
                      onClick={() => setActiveTab("conveses-areas")}
                    >
                      Abrir Conveses & áreas
                    </Button>
                  </div>
                </SectionCard>

                <SectionCard title="Relações de projeto" icon="pi-gauge">
                  <div className="vessel-details-kv-list">
                    <div className="vessel-details-kv-row">
                      <span>LOA / boca</span>
                      <strong className="vessel-details-tabular">
                        {loaBeamRatio}
                      </strong>
                    </div>
                    <div className="vessel-details-kv-row">
                      <span>GT por passageiro (espaço)</span>
                      <strong className="vessel-details-tabular">
                        {gtPerPassenger}
                      </strong>
                    </div>
                    <div className="vessel-details-kv-row">
                      <span>Idade da embarcação</span>
                      <strong>{vesselAgeText}</strong>
                    </div>
                  </div>
                </SectionCard>
              </aside>
            </div>
          </TabPanel>
        )}

        {/* ====================================================================
            ABA 03 · CAPACIDADE (Figma E · 03 #5932:33542)
            ==================================================================== */}
        {activeTab === "capacidade" && (
          <TabPanel idPrefix={tabsIdPrefix} tabId="capacidade">
            <div className="vessel-details-tab-stack">
              <div className="vessel-details-kpis-row">
                <KPI
                  label="Passageiros (máx.)"
                  icon="pi-users"
                  value={formatMetric(vessel.maxPassengerCapacity)}
                  detailText="Capacidade máxima certificada"
                />
                <KPI
                  label="Tripulação (máx.)"
                  icon="pi-id-card"
                  value={formatMetric(vessel.maxCrewCapacity)}
                  detailText="Dotação máxima operacional"
                />
                <KPI
                  label="Total de cabines"
                  value={String(vessel.cabinCount ?? 0)}
                  highlightText="Automático"
                  highlightTone="info"
                  detailText="Soma das cabines dos conveses"
                />
                <KPI
                  label="Salvatagem"
                  icon="pi-shield"
                  value={formatMetric(vessel.lifeboatTotalCapacity)}
                  detailText="Capacidade total de botes e balsas"
                />
              </div>

              <div className="vessel-details-layout-grid">
                <div className="vessel-details-main-col">
                  <SectionCard
                    title="Capacidade e lotação"
                    icon="pi-users"
                    subtitle="Limites operacionais e de segurança cadastrados para a embarcação."
                  >
                    <dl className="vessel-details-dl-grid">
                      <div className="vessel-details-dl-item">
                        <dt>Capacidade máx. de passageiros</dt>
                        <dd className="vessel-details-tabular">
                          {formatMetric(vessel.maxPassengerCapacity, "pessoas")}
                        </dd>
                      </div>
                      <div className="vessel-details-dl-item">
                        <dt>Capacidade máx. de tripulantes</dt>
                        <dd className="vessel-details-tabular">
                          {formatMetric(vessel.maxCrewCapacity, "tripulantes")}
                        </dd>
                      </div>
                      <div className="vessel-details-dl-item">
                        <dt>
                          <span>Total de cabines</span>
                          <Badge tone="automatic" size="sm">
                            Automático
                          </Badge>
                        </dt>
                        <dd className="vessel-details-tabular">
                          {vessel.cabinCount ?? 0}
                        </dd>
                      </div>
                      <div className="vessel-details-dl-item">
                        <dt>Capacidade total de botes salva-vidas</dt>
                        <dd className="vessel-details-tabular">
                          {formatMetric(
                            vessel.lifeboatTotalCapacity,
                            "lugares"
                          )}
                        </dd>
                      </div>
                    </dl>
                  </SectionCard>

                  <SectionCard
                    title="Cabines por categoria"
                    subtitle="Distribuição calculada a partir das cabines cadastradas nos conveses."
                    icon="pi-th-large"
                  >
                    <EmptyState
                      compact
                      icon="pi-th-large"
                      title="Nenhuma cabine cadastrada nos conveses"
                      description="O detalhamento por categoria (Interna, Externa, Varanda, Suíte e Acessível) não possui registros porque a embarcação ainda possui 0 cabines cadastradas na API."
                    />
                  </SectionCard>
                </div>

                <aside className="vessel-details-side-col">
                  <SectionCard title="Cobertura de salvatagem" icon="pi-shield">
                    <div className="vessel-details-kv-list">
                      <div className="vessel-details-kv-row">
                        <span>Lotação máxima (pass. + trip.)</span>
                        <strong className="vessel-details-tabular">
                          {totalAboard > 0
                            ? `${totalAboard.toLocaleString("pt-BR")} pessoas`
                            : "—"}
                        </strong>
                      </div>
                      <div className="vessel-details-kv-row">
                        <span>Capacidade de botes salva-vidas</span>
                        <strong className="vessel-details-tabular">
                          {formatMetric(
                            vessel.lifeboatTotalCapacity,
                            "lugares"
                          )}
                        </strong>
                      </div>
                      <div className="vessel-details-kv-row">
                        <span>Índice de cobertura SOLAS</span>
                        <strong className="vessel-details-tabular">
                          {lifeboatCoveragePct !== null
                            ? `${lifeboatCoveragePct}%`
                            : "—"}
                        </strong>
                      </div>
                    </div>

                    {lifeboatCoveragePct !== null && (
                      <div className="vessel-details-solas-box">
                        <div
                          className="vessel-details-progress-track"
                          role="progressbar"
                          aria-valuenow={Math.min(lifeboatCoveragePct, 100)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            className="vessel-details-progress-fill"
                            style={{
                              width: `${Math.min(lifeboatCoveragePct, 100)}%`,
                            }}
                          />
                        </div>

                        <Alert
                          variant={
                            lifeboatCoveragePct >= 100 ? "success" : "warning"
                          }
                          title={
                            lifeboatCoveragePct >= 100
                              ? `Cobertura de ${lifeboatCoveragePct}% em conformidade`
                              : `Cobertura de ${lifeboatCoveragePct}% abaixo de 100%`
                          }
                          description={
                            lifeboatCoveragePct >= 100
                              ? "A capacidade de salvatagem atende ou supera a lotação máxima de pessoas a bordo exigida pela convenção SOLAS."
                              : "A capacidade de botes salva-vidas informada é inferior à soma de passageiros e tripulantes."
                          }
                        />
                      </div>
                    )}
                  </SectionCard>
                </aside>
              </div>
            </div>
          </TabPanel>
        )}

        {/* ====================================================================
            ABA 04 · CONVESES & ÁREAS (Figma E · 04 #5932:33687)
            ==================================================================== */}
        {activeTab === "conveses-areas" && (
          <TabPanel idPrefix={tabsIdPrefix} tabId="conveses-areas">
            <div className="vessel-details-tab-stack">
              <div className="vessel-details-summary-strip">
                <div className="vessel-details-summary-strip__info">
                  <i className="pi pi-info-circle" aria-hidden="true" />
                  <span>
                    O número de conveses (
                    <strong>{vessel.deckCount ?? 0}</strong>), cabines (
                    <strong>{vessel.cabinCount ?? 0}</strong>) e áreas (
                    <strong>{vessel.totalAreas ?? 0}</strong>) é calculado
                    automaticamente pelo backend a partir da estrutura interna
                    da embarcação.
                  </span>
                </div>
                <Badge tone="automatic" size="sm">
                  Cálculo automático
                </Badge>
              </div>

              <SectionCard
                title="Conveses e áreas da embarcação"
                subtitle="Listagem de conveses, cabines e áreas comuns/operacionais a bordo."
                icon="pi-sitemap"
              >
                <EmptyState
                  compact
                  icon="pi-clone"
                  title="Nenhum convés ou área cadastrada"
                  description="A API retornou 0 conveses e 0 áreas para esta embarcação. Ainda não existem endpoints de leitura de conveses e áreas detalhadas disponíveis no backend."
                />
              </SectionCard>
            </div>
          </TabPanel>
        )}

        {/* ====================================================================
            ABA 05 · CERTIFICAÇÕES (Figma E · 05 #5932:34043)
            ==================================================================== */}
        {activeTab === "certificacoes" && (
          <TabPanel idPrefix={tabsIdPrefix} tabId="certificacoes">
            <div className="vessel-details-tab-stack">
              <SectionCard
                title="Classificação e conformidade"
                subtitle="Dados de classe naval (IACS) e certificação internacional de gestão de segurança."
                icon="pi-shield"
              >
                <dl className="vessel-details-dl-grid">
                  <div className="vessel-details-dl-item">
                    <dt>Sociedade classificadora (IACS)</dt>
                    <dd>
                      {formatClassificationDisplay(
                        vessel.classificationSociety
                      )}
                    </dd>
                  </div>
                  <div className="vessel-details-dl-item">
                    <dt>Certificação Código ISM</dt>
                    <dd className="vessel-details-tabular">
                      {vessel.ismCertification || "—"}
                    </dd>
                  </div>
                  <div className="vessel-details-dl-item">
                    <dt>Data de validade do certificado</dt>
                    <dd className="vessel-details-dl-inline">
                      <span className="vessel-details-tabular">
                        {compliance.expiryFormatted}
                      </span>
                      <Badge tone={compliance.badgeTone} size="sm" dot>
                        {compliance.shortLabel}
                      </Badge>
                    </dd>
                  </div>
                  <div className="vessel-details-dl-item">
                    <dt>Status operacional atual</dt>
                    <dd>
                      <Badge tone={statusDisplay.tone} size="sm" dot>
                        {statusDisplay.label}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </SectionCard>

              <SectionCard
                title="Certificados estatutários"
                subtitle="Registro oficial de certificados retornado pela API para esta embarcação."
                icon="pi-file"
                flush
                actions={
                  <div className="vessel-details-chip-group">
                    <FilterChip
                      count={certificateRows.length}
                      selected={certificateFilter === "ALL"}
                      onClick={() => setCertificateFilter("ALL")}
                    >
                      Todos
                    </FilterChip>
                    <FilterChip
                      count={
                        certificateRows.filter((row) => row.hasAlert).length
                      }
                      selected={certificateFilter === "ALERT"}
                      onClick={() => setCertificateFilter("ALERT")}
                    >
                      Com alerta
                    </FilterChip>
                    <FilterChip
                      count={
                        certificateRows.filter((row) => !row.hasAlert).length
                      }
                      selected={certificateFilter === "VALID"}
                      onClick={() => setCertificateFilter("VALID")}
                    >
                      Válidos
                    </FilterChip>
                  </div>
                }
              >
                {filteredCertificateRows.length > 0 ? (
                  <DataTable<StatutoryCertificateRow>
                    columns={certificateColumns}
                    data={filteredCertificateRows}
                    rowKey={(row) => row.id}
                  />
                ) : (
                  <EmptyState
                    compact
                    icon="pi-shield"
                    title="Nenhum certificado neste filtro"
                    description="Não há certificados correspondentes ao filtro selecionado."
                    secondaryActionLabel={
                      certificateFilter !== "ALL" ? "Exibir todos" : undefined
                    }
                    onSecondaryAction={
                      certificateFilter !== "ALL"
                        ? () => setCertificateFilter("ALL")
                        : undefined
                    }
                  />
                )}
              </SectionCard>
            </div>
          </TabPanel>
        )}

        {/* ====================================================================
            ABA 06 · DOCUMENTOS (Figma E · 06 #5932:34182)
            ==================================================================== */}
        {activeTab === "documentos" && (
          <TabPanel idPrefix={tabsIdPrefix} tabId="documentos">
            <SectionCard
              title="Documentação técnica"
              subtitle="Plantas de arranjo geral, plano de salvatagem e manuais da embarcação."
              icon="pi-folder"
            >
              <EmptyState
                compact
                icon="pi-folder-open"
                title="Listagem de documentos não disponível na API"
                description="Os metadados de documentos anexados no cadastro são persistidos na tabela vessel_document, mas ainda não são retornados pelo contrato GET /api/erp/vessels (VesselResponseDTO)."
              />
            </SectionCard>
          </TabPanel>
        )}

        {/* ====================================================================
            ABA 07 · VIAGENS (Figma E · 07 #5932:34351)
            ==================================================================== */}
        {activeTab === "viagens" && (
          <TabPanel idPrefix={tabsIdPrefix} tabId="viagens">
            <SectionCard
              title="Viagens da embarcação"
              subtitle="Viagens programadas, em andamento e histórico de travessias."
              icon="pi-send"
              actions={
                <div className="vessel-details-chip-group">
                  <FilterChip
                    count={0}
                    selected={tripFilter === "ALL"}
                    onClick={() => setTripFilter("ALL")}
                  >
                    Todas
                  </FilterChip>
                  <FilterChip
                    count={0}
                    selected={tripFilter === "SCHEDULED"}
                    onClick={() => setTripFilter("SCHEDULED")}
                  >
                    Programadas
                  </FilterChip>
                  <FilterChip
                    count={0}
                    selected={tripFilter === "COMPLETED"}
                    onClick={() => setTripFilter("COMPLETED")}
                  >
                    Concluídas e canceladas
                  </FilterChip>
                </div>
              }
            >
              <EmptyState
                compact
                icon="pi-calendar"
                title="Nenhuma viagem registrada para esta embarcação"
                description="O módulo de viagens ainda não possui registros vinculados a este navio na API."
              />
            </SectionCard>
          </TabPanel>
        )}

        {/* ====================================================================
            ABA 08 · HISTÓRICO (Figma E · 08 #5932:34499)
            ==================================================================== */}
        {activeTab === "historico" && (
          <TabPanel idPrefix={tabsIdPrefix} tabId="historico">
            <SectionCard
              title="Histórico de alterações"
              subtitle="Eventos auditáveis registrados para esta embarcação."
              icon="pi-history"
            >
              <div className="vessel-details-timeline">
                <div className="vessel-details-timeline__item">
                  <div
                    className="vessel-details-timeline__marker"
                    aria-hidden="true"
                  >
                    <i className="pi pi-plus-circle" />
                  </div>
                  <div className="vessel-details-timeline__content">
                    <div className="vessel-details-timeline__header">
                      <strong>Embarcação cadastrada no sistema</strong>
                      <span className="vessel-details-tabular">
                        {formatDateTimeBr(vessel.createdAt)}
                      </span>
                    </div>
                    <p className="vessel-details-timeline__desc">
                      Registro inicial de <strong>{vessel.vesselName}</strong>{" "}
                      (IMO {vessel.imoNumber || "—"}, Registro Nacional{" "}
                      {vessel.nationalRegistrationNumber || "—"}) vinculado à
                      empresa{" "}
                      <strong>{vessel.companyName || "Não informada"}</strong>{" "}
                      com status operacional{" "}
                      <strong>{statusDisplay.label}</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>
          </TabPanel>
        )}
      </div>
    </div>
  );
}
