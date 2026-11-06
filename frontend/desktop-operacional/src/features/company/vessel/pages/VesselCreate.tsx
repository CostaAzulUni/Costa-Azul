import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Toast,
  WizardStepper,
  type ToastVariant,
  type WizardStep,
} from "../../../../components";
import "./VesselCreate.css";
import { VesselBasicInfo } from "../componets/VesselBasicInfo";
import { VesselTechnicalInfo } from "../componets/VesselTechnicalInfo";
import { VesselCapacity } from "../componets/VesselCapacity";
import { VesselCertification } from "../componets/VesselCertification";
import { VesselOperational } from "../componets/VesselOperational";
import { VesselDocuments } from "../componets/VesselDocumets";
import { VesselReviewStep } from "../componets/VesselReviewStep";
import { VesselSummarySidebar } from "../componets/VesselSummarySidebar";
import {
  INITIAL_VESSEL_FORM_DATA,
  NEXT_STEP_BUTTON_LABELS,
  OPERATIONAL_STATUS_OPTIONS,
  VESSEL_FLAG_OPTIONS,
  VESSEL_WIZARD_STEPS,
  areAllVesselStepsValid,
  getOptionLabel,
  isVesselStepValid,
  validateVesselStep,
  type VesselFieldErrors,
  type VesselFieldKey,
  type VesselFormData,
} from "../vesselFormConfig";
import {
  createVessel,
  type DocumentDTO,
  type VesselRequestDTO,
  type VesselResponseDTO,
} from "../../../../services/vesselcreate";

interface ToastFeedback {
  variant: ToastVariant;
  title: string;
  description?: string;
}

interface ApiErrorFeedback {
  title: string;
  description: string;
}

export function VesselCreate() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<VesselFormData>(
    INITIAL_VESSEL_FORM_DATA
  );
  const [errors, setErrors] = useState<VesselFieldErrors>({});

  // Estado elevado de mídia e anexos para não perder dados ao trocar de etapa
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastFeedback, setToastFeedback] = useState<ToastFeedback | null>(
    null
  );
  const [apiError, setApiError] = useState<ApiErrorFeedback | null>(null);
  const [createdVessel, setCreatedVessel] =
    useState<VesselResponseDTO | null>(null);

  const totalSteps = VESSEL_WIZARD_STEPS.length;

  const handleFieldChange = <K extends VesselFieldKey>(
    field: K,
    value: VesselFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handlePhotoChange = (file: File | null, preview: string | null) => {
    setPhotoFile(file);
    setPhotoPreview(preview);
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep === currentStep) return;
    setCurrentStep(targetStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveDraft = () => {
    setToastFeedback({
      variant: "warning",
      title: "Persistência de rascunho indisponível",
      description:
        "O backend ainda não possui endpoint para salvar rascunhos. Conclua as etapas para cadastrar a embarcação.",
    });
  };

  const handleResetWizard = () => {
    setFormData(INITIAL_VESSEL_FORM_DATA);
    setErrors({});
    setPhotoFile(null);
    setPhotoPreview(null);
    setDocuments([]);
    setApiError(null);
    setToastFeedback(null);
    setCreatedVessel(null);
    setCurrentStep(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateVessel = async () => {
    if (isSubmitting) return;

    setApiError(null);
    setToastFeedback(null);

    // Valida todas as 5 etapas obrigatórias (0 a 4) antes de permitir o envio
    let allErrors: VesselFieldErrors = {};
    let firstInvalidStep: number | null = null;

    for (let step = 0; step <= 4; step += 1) {
      const stepValidationErrors = validateVesselStep(step, formData);
      if (Object.keys(stepValidationErrors).length > 0) {
        allErrors = { ...allErrors, ...stepValidationErrors };
        if (firstInvalidStep === null) {
          firstInvalidStep = step;
        }
      }
    }

    if (firstInvalidStep !== null) {
      setErrors(allErrors);
      setCurrentStep(firstInvalidStep);
      setToastFeedback({
        variant: "error",
        title: "Campos obrigatórios pendentes",
        description: `Preencha ou corrija os campos destacados na etapa "${VESSEL_WIZARD_STEPS[firstInvalidStep].title}" antes de concluir o cadastro.`,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const mappedDocuments: DocumentDTO[] = documents.map((file) => ({
      documentType: "TECHNICAL_DOCUMENT",
      fileName: file.name,
      fileUrl: `pending-upload://${encodeURIComponent(file.name)}`,
      mimeType: file.type || "application/octet-stream",
      fileSizeBytes: file.size,
    }));

    const payload: VesselRequestDTO = {
      idCompany: null,
      vesselName: formData.vesselName.trim(),
      nationalRegistrationNumber: formData.nationalRegistrationNumber.trim(),
      flag: formData.flag,
      imoNumber: formData.imoNumber.trim(),
      photoUrl: photoFile ? photoFile.name : null,
      yearBuilt: formData.yearBuilt,
      shipyard: formData.shipyard.trim(),
      grossTonnage: formData.grossTonnage,
      deadweightTonnage: formData.deadweightTonnage,
      lengthOverall: formData.lengthOverall,
      maxBeam: formData.maxBeam,
      operatingDraft: formData.operatingDraft,
      maxServiceSpeed: formData.maxServiceSpeed,
      mainPropulsion: formData.mainPropulsion,
      maxPassengerCapacity: formData.maxPassengerCapacity,
      maxCrewCapacity: formData.maxCrewCapacity,
      lifeboatTotalCapacity: formData.lifeboatTotalCapacity,
      classificationSociety: formData.classificationSociety,
      ismCertification: formData.ismCertification.trim(),
      certificateExpiryDate: formData.certificateExpiryDate || null,
      operationalStatus: formData.operationalStatus,
      idHomePort: formData.idHomePort.trim() || null,
      mainTerminal: formData.mainTerminal.trim(),
      idManager: formData.idManager.trim() || null,
      operationalEmail: formData.operationalEmail.trim(),
      documents: mappedDocuments,
    };

    try {
      setIsSubmitting(true);

      const response = await createVessel(payload);

      setCreatedVessel(response);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const errorTitle = "Não foi possível concluir o cadastro";
      let errorDescription =
        "Ocorreu uma falha inesperada ao processar o envio. Seus dados foram preservados para nova tentativa.";

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const isTimeout =
          error.code === "ECONNABORTED" ||
          /timeout/i.test(error.message || "");
        const responseData = error.response?.data as
          | { message?: string; error?: string; detail?: string }
          | string
          | undefined;
        const rawBackendMessage =
          typeof responseData === "string"
            ? responseData
            : responseData?.message ||
              responseData?.detail ||
              responseData?.error;
        const safeBackendMessage =
          rawBackendMessage &&
          rawBackendMessage !== "Internal Server Error" &&
          rawBackendMessage !== "Bad Request" &&
          rawBackendMessage !== "Forbidden"
            ? rawBackendMessage
            : undefined;

        if (isTimeout) {
          errorDescription =
            "O servidor demorou muito para responder e não foi possível confirmar o resultado da operação. Verifique a listagem de embarcações antes de tentar reenviar. Seus dados continuam preservados nesta tela.";
        } else if (!error.response) {
          errorDescription =
            "Não foi possível conectar ao servidor (http://localhost:8080). Verifique sua conexão ou se o backend está em execução. Todos os dados preenchidos foram preservados para tentar novamente.";
        } else if (status === 400 || status === 409 || status === 422) {
          errorDescription =
            safeBackendMessage ||
            "Os dados enviados foram recusados pela validação do servidor. Verifique se o número IMO ou Registro Nacional já existem.";
        } else if (status === 401) {
          errorDescription =
            "Sua sessão expirou ou você não está autenticado (HTTP 401). Faça login novamente para concluir o cadastro.";
        } else if (status === 403) {
          errorDescription =
            "Seu perfil não possui permissão para cadastrar embarcações (HTTP 403). É necessário acesso de Administrador da Companhia ou Super Admin.";
        } else if (status === 404) {
          errorDescription =
            "O endpoint de cadastro (/api/erp/vessels) não foi encontrado no servidor (HTTP 404).";
        } else if (status && status >= 500) {
          errorDescription =
            safeBackendMessage ||
            "Ocorreu um erro interno no servidor (HTTP 500) ao gravar a embarcação. Verifique se o IMO ou Registro Nacional já estão em uso e tente novamente.";
        }
      }

      setApiError({
        title: errorTitle,
        description: errorDescription,
      });
      setToastFeedback({
        variant: "error",
        title: errorTitle,
        description: errorDescription,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tela de conclusão — exibida SOMENTE após retorno HTTP 200/201 da API (Figma #5932:32933)
  if (createdVessel) {
    const registeredStatusLabel =
      OPERATIONAL_STATUS_OPTIONS.find(
        (opt) => opt.value === createdVessel.operationalStatus
      )?.label ?? createdVessel.operationalStatus;

    const registeredFlagLabel = getOptionLabel(
      VESSEL_FLAG_OPTIONS,
      createdVessel.flag
    );

    const homePortDisplay =
      createdVessel.mainTerminal?.trim() || "Não informado";

    return (
      <div className="vessel-create-shell">
        <div className="vessel-completion-page">
          <section
            className="vessel-completion-card"
            aria-labelledby="vessel-completion-title"
          >
            <div className="vessel-completion-card__icon" aria-hidden="true">
              <i className="pi pi-check-circle" />
            </div>

            <h1
              id="vessel-completion-title"
              className="vessel-completion-card__title"
            >
              {createdVessel.vesselName} foi cadastrada
            </h1>

            <p className="vessel-completion-card__subtitle">
              IMO {createdVessel.imoNumber} · Status: {registeredStatusLabel} ·
              Porto/Terminal base: {homePortDisplay}
            </p>

            <div className="vessel-completion-card__meta">
              <Badge tone="neutral" size="sm">
                Registro: {createdVessel.nationalRegistrationNumber}
              </Badge>
              <Badge tone="neutral" size="sm">
                Bandeira: {registeredFlagLabel}
              </Badge>
              {createdVessel.companyName && (
                <Badge tone="automatic" size="sm">
                  {createdVessel.companyName}
                </Badge>
              )}
            </div>

            <div className="vessel-completion-next">
              <h2 className="vessel-completion-next__heading">
                PRÓXIMOS PASSOS
              </h2>

              <div className="vessel-completion-next__grid">
                <article className="vessel-completion-step">
                  <div
                    className="vessel-completion-step__icon"
                    aria-hidden="true"
                  >
                    <i className="pi pi-clone" />
                  </div>
                  <h3 className="vessel-completion-step__title">
                    Cadastrar conveses
                  </h3>
                  <p className="vessel-completion-step__desc">
                    Organize os conveses para depois incluir cabines e áreas.
                  </p>
                  <button
                    type="button"
                    className="vessel-completion-step__link"
                    onClick={() => navigate("/vessel")}
                  >
                    <span>Começar</span>
                    <i className="pi pi-arrow-right" aria-hidden="true" />
                  </button>
                </article>

                <article className="vessel-completion-step">
                  <div
                    className="vessel-completion-step__icon"
                    aria-hidden="true"
                  >
                    <i className="pi pi-th-large" />
                  </div>
                  <h3 className="vessel-completion-step__title">
                    Cadastrar cabines
                  </h3>
                  <p className="vessel-completion-step__desc">
                    Defina categorias, capacidade e disponibilidade.
                  </p>
                  <button
                    type="button"
                    className="vessel-completion-step__link"
                    onClick={() => navigate("/vessel")}
                  >
                    <span>Começar</span>
                    <i className="pi pi-arrow-right" aria-hidden="true" />
                  </button>
                </article>

                <article className="vessel-completion-step">
                  <div
                    className="vessel-completion-step__icon"
                    aria-hidden="true"
                  >
                    <i className="pi pi-calendar" />
                  </div>
                  <h3 className="vessel-completion-step__title">
                    Programar primeira viagem
                  </h3>
                  <p className="vessel-completion-step__desc">
                    Disponível quando o status for Em operação.
                  </p>
                  <button
                    type="button"
                    className="vessel-completion-step__link"
                    onClick={() => navigate("/trips")}
                  >
                    <span>Começar</span>
                    <i className="pi pi-arrow-right" aria-hidden="true" />
                  </button>
                </article>
              </div>
            </div>

            <div className="vessel-completion-actions">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => navigate("/vessel")}
              >
                Voltar para Navios
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleResetWizard}
              >
                Cadastrar outra embarcação
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => navigate("/vessel")}
              >
                Ver ficha da embarcação
              </Button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  const stepsWithStatus: WizardStep[] = VESSEL_WIZARD_STEPS.map(
    (step, index) => ({
      ...step,
      completed: isVesselStepValid(index, formData),
    })
  );

  const allFormStepsValid = areAllVesselStepsValid(formData);

  return (
    <div className="vessel-create-shell">
      {toastFeedback && (
        <Toast
          variant={toastFeedback.variant}
          message={toastFeedback.title}
          description={toastFeedback.description}
          durationMs={5000}
          onClose={() => setToastFeedback(null)}
        />
      )}

      <div className="vessel-create-container">
        <Breadcrumb
          items={[
            { label: "Frota e Viagens", onClick: () => navigate("/vessel") },
            { label: "Navios", onClick: () => navigate("/vessel") },
            { label: "Nova embarcação" },
          ]}
        />

        <header className="vessel-header">
          <div className="vessel-header__titles">
            <div className="vessel-header__title-row">
              <h1 className="vessel-header__title">Cadastrar embarcação</h1>
              <Badge tone="neutral" size="md" dot>
                Rascunho
              </Badge>
            </div>
            <p className="vessel-header__subtitle">
              Preencha em etapas. Os campos obrigatórios de cada passo são
              validados para conclusão do cadastro.
            </p>
          </div>

          <div className="vessel-header__draft-status">
            <i className="pi pi-info-circle" aria-hidden="true" />
            <span>Ainda não salvo</span>
          </div>
        </header>

        {apiError && (
          <Alert
            variant="error"
            title={apiError.title}
            description={apiError.description}
            actionLabel="Fechar"
            onAction={() => setApiError(null)}
          />
        )}

        <WizardStepper
          steps={stepsWithStatus}
          currentIndex={currentStep}
          onStepClick={handleStepClick}
          allowFutureNavigation
        />

        <div className="vessel-main-grid">
          <div className="vessel-form-column">
            {currentStep === 0 && (
              <VesselBasicInfo
                formData={formData}
                errors={errors}
                onFieldChange={handleFieldChange}
                photoFile={photoFile}
                photoPreview={photoPreview}
                onPhotoChange={handlePhotoChange}
              />
            )}

            {currentStep === 1 && (
              <VesselTechnicalInfo
                formData={formData}
                errors={errors}
                onFieldChange={handleFieldChange}
              />
            )}

            {currentStep === 2 && (
              <VesselCapacity
                formData={formData}
                errors={errors}
                onFieldChange={handleFieldChange}
              />
            )}

            {currentStep === 3 && (
              <VesselCertification
                formData={formData}
                errors={errors}
                onFieldChange={handleFieldChange}
              />
            )}

            {currentStep === 4 && (
              <div className="vessel-step-stack">
                <VesselOperational
                  formData={formData}
                  errors={errors}
                  onFieldChange={handleFieldChange}
                />
                <VesselDocuments
                  documents={documents}
                  onDocumentsChange={setDocuments}
                />
              </div>
            )}

            {currentStep === 5 && (
              <VesselReviewStep
                formData={formData}
                documentsCount={documents.length}
                onEditStep={(stepIndex) => {
                  setCurrentStep(stepIndex);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            )}
          </div>

          <VesselSummarySidebar
            formData={formData}
            photoPreview={photoPreview}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        </div>
      </div>

      <footer className="vessel-action-bar">
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={() => navigate("/vessel")}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>

        <span className="vessel-action-bar__status">
          {currentStep < totalSteps - 1
            ? `Etapa ${currentStep + 1} de ${totalSteps} · campos com * são obrigatórios`
            : allFormStepsValid
              ? "Tudo pronto · revise antes de cadastrar"
              : "Existem etapas pendentes · revise os campos obrigatórios antes de cadastrar"}
        </span>

        <div className="vessel-action-bar__buttons">
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="vessel-btn-draft"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
          >
            Salvar rascunho
          </Button>

          {currentStep > 0 && (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handlePrevStep}
              disabled={isSubmitting}
            >
              Voltar
            </Button>
          )}

          {currentStep < totalSteps - 1 ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleNextStep}
            >
              {NEXT_STEP_BUTTON_LABELS[currentStep]}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleCreateVessel}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Cadastrando..." : "Cadastrar embarcação"}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
