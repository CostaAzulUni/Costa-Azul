import { Badge, Button } from "../../../../components";
import type { VesselResponseDTO } from "../../../../services/vesselcreate";
import { getOptionLabel, OPERATIONAL_STATUS_OPTIONS, VESSEL_FLAG_OPTIONS } from "../form";
import "./VesselCreate.css";



interface VesselCreateSuccessProps {
  vessel: VesselResponseDTO;
  onBackToList: () => void;
  onViewDetails: () => void;
  onStartDecks: () => void;
  onStartCabins: () => void;
  onScheduleTrip: () => void;
}


export function VesselCreateSuccess({
  vessel,
  onBackToList,
  onViewDetails,
  onStartDecks,
  onStartCabins,
  onScheduleTrip
}: VesselCreateSuccessProps) {

    const registeredStatusLabel =
      OPERATIONAL_STATUS_OPTIONS.find(
        (opt) => opt.value === vessel.operationalStatus
      )?.label ?? vessel.operationalStatus;

    const registeredFlagLabel = getOptionLabel(
      VESSEL_FLAG_OPTIONS,
      vessel.flag
    );

    const homePortDisplay =
      vessel.mainTerminal?.trim() || "Não informado";

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
                  {vessel.vesselName} foi cadastrada
                </h1>
    
                <p className="vessel-completion-card__subtitle">
                  IMO {vessel.imoNumber} · Status: {registeredStatusLabel} ·
                  Porto/Terminal base: {homePortDisplay}
                </p>
    
                <div className="vessel-completion-card__meta">
                  <Badge tone="neutral" size="sm">
                    Registro: {vessel.nationalRegistrationNumber}
                  </Badge>
                  <Badge tone="neutral" size="sm">
                    Bandeira: {registeredFlagLabel}
                  </Badge>
                  {vessel.companyName && (
                    <Badge tone="automatic" size="sm">
                      {vessel.companyName}
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
                        onClick={onStartDecks}
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
                        onClick={onStartCabins}
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
                        onClick={onScheduleTrip}
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
                    onClick={onBackToList}
                  >
                    Voltar para Navios
                  </Button>
                  
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={onViewDetails}
                  >
                    Ver ficha da embarcação
                  </Button>
                </div>
              </section>
            </div>
          </div>
        );
      }
