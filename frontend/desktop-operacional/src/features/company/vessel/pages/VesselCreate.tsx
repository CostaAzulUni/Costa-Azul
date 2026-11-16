import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Badge, Breadcrumb, Button, Toast, WizardStepper, type ToastVariant, type WizardStep } from "../../../../components";
import "./VesselCreate.css";
import { VesselBasicInfo } from "../componets/VesselBasicInfo";
import { VesselTechnicalInfo } from "../componets/VesselTechnicalInfo";
import { VesselCapacity } from "../componets/VesselCapacity";
import { VesselCertification } from "../componets/VesselCertification";
import { VesselOperational } from "../componets/VesselOperational";
import { VesselDocuments } from "../componets/VesselDocumets";
import { VesselReviewStep } from "../componets/VesselReviewStep";
import { VesselSummarySidebar } from "../componets/VesselSummarySidebar";
import { areAllVesselStepsValid, isVesselStepValid, syncVesselErrors, validateAllVesselSteps, validateVesselStep, VESSEL_WIZARD_STEPS, INITIAL_VESSEL_FORM_DATA, type VesselFieldErrors, type VesselFieldKey, type VesselFormData, NEXT_STEP_BUTTON_LABELS } from "../form";
import { createVessel, type VesselResponseDTO } from "../../../../services/vesselcreate";
import { VesselCreateSuccess } from "./VesselCreateSucess";
import { buildVesselPayload } from "../services/vesselPayload";
import { getVesselApiError, type ApiErrorFeedback,} from "../services/vesselApiErro";

interface ToastFeedback {
  variant: ToastVariant;
  title: string;
  description?: string;
}

// começo da pagina de criação da embarcação:

export function VesselCreate() {
  const navigate = useNavigate(); // navegação 


  const [currentStep, setCurrentStep] = useState(0); // Estado para controlar a etapa atual do wizard
  const [formData, setFormData] = useState<VesselFormData>( INITIAL_VESSEL_FORM_DATA); // Estado para armazenar os dados do formulário ela começa com os dados iniciais definidos em INITIAL_VESSEL_FORM_DATA
  const [errors, setErrors] = useState<VesselFieldErrors>({}); // estado para armazenar os erros de validação dos campos do formulário

  // Estado elevado de mídia e anexos para não perder dados ao trocar de etapa
  const [photoFile, setPhotoFile] = useState<File | null>(null); // Estado para armazenar o arquivo de foto selecionado
  const [photoPreview, setPhotoPreview] = useState<string | null>(null); // Estado para armazenar a URL de visualização da foto selecionada
  const [documents, setDocuments] = useState<File[]>([]); // Estado para armazenar os arquivos de documentos selecionados

  const [isSubmitting, setIsSubmitting] = useState(false); // estado para controlar se o formulário está sendo enviado (submetido) para evitar envios duplicados
  const [toastFeedback, setToastFeedback] = useState<ToastFeedback | null>(null); // estado para armazenar o feedback do Toast (notificação) que será exibido ao usuário
  const [apiError, setApiError] = useState<ApiErrorFeedback | null>(null); // estado para armazenar o feedback de erro da API que será exibido ao usuário
  const [createdVessel, setCreatedVessel] = useState<VesselResponseDTO | null>(null); // estado para armazenar os dados da embarcação criada após o envio bem-sucedido do formulário

  const totalSteps = VESSEL_WIZARD_STEPS.length;

  const handleFieldChange = <K extends VesselFieldKey>(
    field: K,
    value: VesselFormData[K]
  ) => {
    setFormData((prev) => {
      const nextData = { ...prev, [field]: value };
      setErrors((prevErrors) => syncVesselErrors(prevErrors, nextData));
      return nextData;
    });
  };

  const handlePhotoChange = (file: File | null, preview: string | null) => {
    setPhotoFile(file);
    setPhotoPreview(preview);
  };

  const handleBackToList = () => {
    const hasUnsaved =
      photoFile !== null ||
      documents.length > 0 ||
      JSON.stringify(formData) !== JSON.stringify(INITIAL_VESSEL_FORM_DATA);
    if (
      hasUnsaved &&
      !window.confirm("Existem alterações não salvas. Deseja realmente sair do cadastro?")
    ) {
      return;
    }
    navigate("/vessel");
  };

  const handleNextStep = () => {
    const stepErrors = validateVesselStep(currentStep, formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...stepErrors }));
      setToastFeedback({
        variant: "warning",
        title: `Pendências na etapa "${VESSEL_WIZARD_STEPS[currentStep].title}"`,
        description:
          "Existem campos pendentes ou inválidos nesta etapa. Revise-os antes de concluir o cadastro.",
      });
    }
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

 
  const handleCreateVessel = async () => {
    if (isSubmitting) return;

    setApiError(null);
    setToastFeedback(null);

    // Valida todas as 5 etapas obrigatórias (0 a 4) antes de permitir o envio
    const { allErrors, firstInvalidStep } = validateAllVesselSteps(formData);

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

  
    const payload = buildVesselPayload(
      formData,
      documents,
      photoFile
    )

    try {
  setIsSubmitting(true);

  const response = await createVessel(payload);

  setCreatedVessel(response);
  window.scrollTo({ top: 0, behavior: "smooth" });

} catch (error) {
  const feedback = getVesselApiError(error);

  setApiError(feedback);

  setToastFeedback({
    variant: "error",
    title: feedback.title,
    description: feedback.description,
  });

  window.scrollTo({ top: 0, behavior: "smooth" });

} finally {
  setIsSubmitting(false);
}
};

  // Tela de conclusão — exibida SOMENTE após retorno HTTP 200/201 da API 
  if (createdVessel) {
    return (
      <VesselCreateSuccess
        vessel={createdVessel}
        onBackToList={() => navigate("/vessel")}
        onViewDetails={() =>navigate(`/vessel/${createdVessel.idVessel}`, { state: { vessel: createdVessel } })}
        onStartDecks={() => navigate("/vessel")}
        onStartCabins={() => navigate("/vessel")}
        onScheduleTrip={() => navigate("/trips")}
      />);
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
            <Button
              type="button"
              variant="ghost"
              size="md"
              icon="pi-arrow-left"
              onClick={handleBackToList}
              disabled={isSubmitting}
            >
              Voltar
            </Button>
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
              disabled={isSubmitting}
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
