import { useEffect, useId, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {Alert,Badge,Button,TabPanel,Toast,VesselHeader,type ToastVariant } from "../../../../components";
import { deleteVessel, getVesselById, updateVessel, type VesselResponseDTO } from "../../../../services/vesselcreate";
import "./VesselDetails.css";
import { VesselCapacityTab } from "../componets/VesselCapacityTab";
import { VesselCertificationsTab } from "../componets/VesselCertificationsTab";
import { VesselDecksAreasTab, VesselDocumentsDetailTab, VesselHistoryTab, VesselTripsTab } from "../componets/VesselComplementaryTabs";
import { VesselDeleteModal } from "../componets/VesselDeleteModal";
import { VesselDetailsActionBar } from "../componets/VesselDetailsActionBar";
import { VesselOverviewTab } from "../componets/VesselOverviewTab";
import { VesselSpecificationsTab } from "../componets/VesselSpecificationsTab";
import { formatMetric, INITIAL_VESSEL_FORM_DATA, mapVesselToFormData, validateAllVesselSteps, VESSEL_STEP_TO_DETAIL_TAB, type VesselFieldErrors, type VesselFieldKey, type VesselFormData } from "../form";
import { buildVesselUpdatePayload } from "../services/vesselPayload";
import { buildStatutoryCertificateRows, buildVesselDetailTabs, calculateVesselDerivedMetrics, evaluateVesselCompliance, evaluateVesselProfileReadiness, filterStatutoryCertificateRows, formatFlagDisplay, getVesselBasePortDisplay, getVesselStatusDisplay, parseVesselApiError, resolveSafeVesselPhotoUrl, type CertificateFilterType, type TripFilterType, type VesselLocationState } from "../utils";

export function VesselDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const tabsIdPrefix = useId();
  const routeState = location.state as VesselLocationState | null;

  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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
    if (fetchedVessel && (!id || fetchedVessel.idVessel === id)) {
      return fetchedVessel;
    }
    if (routeState?.vessel && (!id || routeState.vessel.idVessel === id)) {
      return routeState.vessel;
    }
    return null;
  }, [routeState?.vessel, fetchedVessel, id]);

  const [activeTab, setActiveTab] = useState<string>("visao-geral");
  const [certificateFilter, setCertificateFilter] =
    useState<CertificateFilterType>("ALL");
  const [tripFilter, setTripFilter] = useState<TripFilterType>("ALL");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState<VesselFormData>(
    INITIAL_VESSEL_FORM_DATA
  );
  const [editErrors, setEditErrors] = useState<VesselFieldErrors>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [toastFeedback, setToastFeedback] = useState<{
    variant: ToastVariant;
    message: string;
    description?: string;
  } | null>(() =>
    routeState?.updatedToast
      ? {
          variant: "success",
          message: "Alterações salvas",
          description:
            "Os dados cadastrais da embarcação foram atualizados com sucesso.",
        }
      : null
  );

  useEffect(() => {
    if (!id || vessel) {
      return;
    }

    let cancelled = false;

    getVesselById(id)
      .then((found) => {
        if (cancelled) return;
        setFetchedVessel(found);
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setFetchedVessel(null);
        setErrorMessage(
          parseVesselApiError(
            error,
            "Não foi possível carregar os dados da embarcação. Verifique sua conexão."
          )
        );
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
  const detailTabs = useMemo(
    () => buildVesselDetailTabs(vessel, compliance),
    [vessel, compliance]
  );

  // Linha real de certificado ISM para a tabela da Aba 05 (E · 05)
  const certificateRows = useMemo(
    () => buildStatutoryCertificateRows(vessel, compliance),
    [vessel, compliance]
  );

  const filteredCertificateRows = useMemo(
    () => filterStatutoryCertificateRows(certificateRows, certificateFilter),
    [certificateRows, certificateFilter]
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

  const derivedMetrics = calculateVesselDerivedMetrics(vessel);

  const handleStartEdit = (targetTab?: string) => {
    setEditFormData(mapVesselToFormData(vessel));
    setEditErrors({});
    if (targetTab) {
      setActiveTab(targetTab);
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (isSaving) return;
    setEditErrors({});
    setIsEditing(false);
  };

  const handleEditFieldChange = <K extends VesselFieldKey>(
    field: K,
    value: VesselFormData[K]
  ) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
    if (editErrors[field]) {
      setEditErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSaveEdit = async () => {
    if (isSaving) return;

    const { allErrors, firstInvalidStep } =
      validateAllVesselSteps(editFormData);

    if (firstInvalidStep !== null) {
      setEditErrors(allErrors);
      const targetTab =
        VESSEL_STEP_TO_DETAIL_TAB[firstInvalidStep] ?? "visao-geral";
      if (activeTab !== targetTab) {
        setActiveTab(targetTab);
      }
      const errorCount = Object.keys(allErrors).length;
      setToastFeedback({
        variant: "error",
        message:
          errorCount === 1
            ? "Corrija 1 campo para salvar"
            : `Corrija ${errorCount} campos para salvar`,
        description:
          "Verifique os campos destacados com erro antes de confirmar as alterações.",
      });
      return;
    }

    const payload = buildVesselUpdatePayload(vessel, editFormData);

    try {
      setIsSaving(true);
      const updated = await updateVessel(vessel.idVessel, payload);
      setFetchedVessel(updated);
      setEditErrors({});
      setIsEditing(false);
      setToastFeedback({
        variant: "success",
        message: "Alterações salvas",
        description:
          "Os dados cadastrais da embarcação foram atualizados com sucesso.",
      });
    } catch (error: unknown) {
      setToastFeedback({
        variant: "error",
        message: "Não foi possível salvar as alterações",
        description: parseVesselApiError(
          error,
          "Ocorreu uma falha ao atualizar os dados da embarcação."
        ),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportSheet = () => {
    window.print();
  };

  const handleOpenDeleteModal = () => {
    setDeleteConfirmation("");
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setDeleteConfirmation("");
  };

  const handleConfirmDeleteVessel = async () => {
    if (!vessel || isDeleting) return;

    const confirmation = deleteConfirmation.trim();
    const vesselName = vessel.vesselName.trim();

    if (confirmation.toLowerCase() !== vesselName.toLowerCase()) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteVessel(vessel.idVessel, confirmation);
      setIsDeleteModalOpen(false);
      navigate("/vessel");
    } catch (error) {
      setToastFeedback({
        variant: "error",
        message: "Não foi possível remover a embarcação",
        description: parseVesselApiError(
          error,
          "Ocorreu um erro ao tentar excluir a embarcação."
        ),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const safePhotoUrl = resolveSafeVesselPhotoUrl(vessel.photoUrl);

  return (
    <div className="vessel-details-page">
      {toastFeedback && (
        <Toast
          variant={toastFeedback.variant}
          message={toastFeedback.message}
          description={toastFeedback.description}
          durationMs={5000}
          onClose={() => setToastFeedback(null)}
        />
      )}

      {/* Cabeçalho Object Page compartilhado entre todas as abas (Figma #5932:33344) */}
      <VesselHeader
        className="vessel-details-header"
        breadcrumb={[
          { label: "Frota e Viagens", to: "/vessel" },
          { label: "Navios", to: "/vessel" },
          { label: vessel.vesselName },
        ]}
        name={vessel.vesselName}
        photoUrl={safePhotoUrl}
        badges={[
          {
            label: statusDisplay.label,
            tone: statusDisplay.tone,
          },
        ]}
        meta={[
          {
            icon: "pi-compass",
            label: `IMO ${vessel.imoNumber || "—"}`,
          },
          {
            icon: "pi-flag",
            label: `Bandeira: ${formatFlagDisplay(vessel.flag)}`,
          },
          {
            icon: "pi-id-card",
            label: `Registro ${vessel.nationalRegistrationNumber || "—"}`,
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
              icon="pi-arrow-left"
              onClick={() => navigate("/vessel")}
            >
              Voltar
            </Button>
            {!isEditing && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  icon="pi-download"
                  onClick={handleExportSheet}
                >
                  Exportar ficha
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  icon="pi-pencil"
                  onClick={() => handleStartEdit()}
                >
                  Editar embarcação
                </Button>
              </>
            )}
            {isEditing && (
              <Badge tone="info" size="md" dot>
                Modo edição
              </Badge>
            )}
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
        {/* ABA 01 · VISÃO GERAL (Figma E · 01 #5932:33339) */}
        {activeTab === "visao-geral" && (
          <TabPanel idPrefix={tabsIdPrefix} tabId="visao-geral">
            <VesselOverviewTab
              vessel={vessel}
              compliance={compliance}
              readiness={readiness}
              isEditing={isEditing}
              editFormData={editFormData}
              editErrors={editErrors}
              onStartEdit={handleStartEdit}
              onEditFieldChange={handleEditFieldChange}
              onNavigateTab={setActiveTab}
            />
          </TabPanel>
        )}

        {/* ABA 02 · ESPECIFICAÇÕES (Figma E · 02 #5932:33464) */}
        {activeTab === "especificacoes" && (
          <TabPanel idPrefix={tabsIdPrefix} tabId="especificacoes">
            <VesselSpecificationsTab
              vessel={vessel}
              derivedMetrics={derivedMetrics}
              isEditing={isEditing}
              editFormData={editFormData}
              editErrors={editErrors}
              onStartEdit={handleStartEdit}
              onEditFieldChange={handleEditFieldChange}
              onNavigateTab={setActiveTab}
            />
          </TabPanel>
        )}

        {/* ABA 03 · CAPACIDADE (Figma E · 03 #5932:33542) */}
        {activeTab === "capacidade" && (
          <TabPanel idPrefix={tabsIdPrefix} tabId="capacidade">
            <VesselCapacityTab
              vessel={vessel}
              derivedMetrics={derivedMetrics}
              isEditing={isEditing}
              editFormData={editFormData}
              editErrors={editErrors}
              onStartEdit={handleStartEdit}
              onEditFieldChange={handleEditFieldChange}
            />
          </TabPanel>
        )}

        {/* ABA 04 · CONVESES & ÁREAS (Figma E · 04 #5932:33687) */}
        {activeTab === "conveses-areas" && (
          <TabPanel idPrefix={tabsIdPrefix} tabId="conveses-areas">
            <VesselDecksAreasTab vessel={vessel} />
          </TabPanel>
        )}

        {/* ABA 05 · CERTIFICAÇÕES (Figma E · 05 #5932:34043) */}
        {activeTab === "certificacoes" && (
          <TabPanel idPrefix={tabsIdPrefix} tabId="certificacoes">
            <VesselCertificationsTab
              vessel={vessel}
              compliance={compliance}
              statusDisplay={statusDisplay}
              certificateRows={certificateRows}
              filteredCertificateRows={filteredCertificateRows}
              certificateFilter={certificateFilter}
              isEditing={isEditing}
              editFormData={editFormData}
              editErrors={editErrors}
              onStartEdit={handleStartEdit}
              onEditFieldChange={handleEditFieldChange}
              onCertificateFilterChange={setCertificateFilter}
            />
          </TabPanel>
        )}

        {/* ABA 06 · DOCUMENTOS (Figma E · 06 #5932:34182) */}
        {activeTab === "documentos" && (
          <TabPanel idPrefix={tabsIdPrefix} tabId="documentos">
            <VesselDocumentsDetailTab />
          </TabPanel>
        )}

        {/* ABA 07 · VIAGENS (Figma E · 07 #5932:34351) */}
        {activeTab === "viagens" && (
          <TabPanel idPrefix={tabsIdPrefix} tabId="viagens">
            <VesselTripsTab
              tripFilter={tripFilter}
              onTripFilterChange={setTripFilter}
            />
          </TabPanel>
        )}

        {/* ABA 08 · HISTÓRICO (Figma E · 08 #5932:34499) */}
        {activeTab === "historico" && (
          <TabPanel idPrefix={tabsIdPrefix} tabId="historico">
            <VesselHistoryTab vessel={vessel} statusDisplay={statusDisplay} />
          </TabPanel>
        )}

        {/* Rodapé de Ações da Ficha (Visualização: Figma E · 12 #6024:32803 | Edição: Figma E · 09 #5932:34596) */}
        <VesselDetailsActionBar
          isEditing={isEditing}
          isSaving={isSaving}
          editErrors={editErrors}
          onCancelEdit={handleCancelEdit}
          onSaveEdit={handleSaveEdit}
          onExportSheet={handleExportSheet}
          onOpenDeleteModal={handleOpenDeleteModal}
        />
      </div>

      {/* Modal de Confirmação de Remoção (Figma E · 16 #6020:27973) */}
      <VesselDeleteModal
        open={isDeleteModalOpen}
        vessel={vessel}
        safePhotoUrl={safePhotoUrl}
        statusDisplay={statusDisplay}
        deleteConfirmation={deleteConfirmation}
        isDeleting={isDeleting}
        onClose={handleCloseDeleteModal}
        onDeleteConfirmationChange={setDeleteConfirmation}
        onConfirmDelete={handleConfirmDeleteVessel}
      />
    </div>
  );
}
