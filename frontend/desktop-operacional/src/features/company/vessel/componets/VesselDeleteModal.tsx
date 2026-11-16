import { Badge, Button, Input, Modal } from "../../../../components";
import type { VesselResponseDTO } from "../../../../services/vesselcreate";
import { formatMetric } from "../form";
import { formatFlagDisplay, type VesselStatusDisplay } from "../utils";

export interface VesselDeleteModalProps {
  open: boolean;
  vessel: VesselResponseDTO;
  safePhotoUrl?: string;
  statusDisplay: VesselStatusDisplay;
  deleteConfirmation: string;
  isDeleting: boolean;
  onClose: () => void;
  onDeleteConfirmationChange: (value: string) => void;
  onConfirmDelete: () => void;
}

export function VesselDeleteModal({
  open,
  vessel,
  safePhotoUrl,
  statusDisplay,
  deleteConfirmation,
  isDeleting,
  onClose,
  onDeleteConfirmationChange,
  onConfirmDelete,
}: VesselDeleteModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirmar remoção"
      subtitle="Selecione a embarcação correta antes de confirmar a remoção."
      size="md"
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            icon="pi-trash"
            disabled={
              isDeleting ||
              deleteConfirmation.trim() !== vessel.vesselName.trim()
            }
            onClick={onConfirmDelete}
            title="Digite o nome da embarcação para habilitar a remoção"
          >
            {isDeleting ? "Removendo..." : "Confirmar remoção"}
          </Button>
        </>
      }
    >
      <div className="vessel-details-delete-modal">
        <div className="vessel-details-delete-modal__section-header">
          <span className="vessel-details-delete-modal__section-title">
            Embarcação selecionada
          </span>
          <Badge tone="neutral" size="sm">
            1 selecionada
          </Badge>
        </div>

        <div className="vessel-details-delete-modal__vessel-card">
          <div className="vessel-details-delete-modal__summary">
            <div className="vessel-details-delete-modal__photo">
              {safePhotoUrl ? (
                <img
                  src={safePhotoUrl}
                  alt={`Foto da embarcação ${vessel.vesselName}`}
                />
              ) : (
                <div
                  className="vessel-details-delete-modal__photo-placeholder"
                  aria-hidden="true"
                >
                  <i className="pi pi-compass" />
                  <span>Substitua pela foto</span>
                </div>
              )}
            </div>

            <div className="vessel-details-delete-modal__info">
              <div className="vessel-details-delete-modal__title-row">
                <strong className="vessel-details-delete-modal__name">
                  {vessel.vesselName}
                </strong>
                <Badge tone={statusDisplay.tone} size="sm" dot>
                  {statusDisplay.label}
                </Badge>
              </div>

              <div className="vessel-details-delete-modal__meta">
                <span>IMO {vessel.imoNumber || "—"}</span>
                <span aria-hidden="true">·</span>
                <span>Bandeira: {formatFlagDisplay(vessel.flag)}</span>
                <span aria-hidden="true">·</span>
                <span>
                  Registro {vessel.nationalRegistrationNumber || "—"}
                </span>
              </div>

              <div className="vessel-details-delete-modal__metrics">
                <div className="vessel-details-delete-modal__metric">
                  <span className="vessel-details-delete-modal__metric-label">
                    Arqueação bruta
                  </span>
                  <strong className="vessel-details-delete-modal__metric-value vessel-details-tabular">
                    {formatMetric(vessel.grossTonnage, "GT")}
                  </strong>
                </div>
                <div className="vessel-details-delete-modal__metric">
                  <span className="vessel-details-delete-modal__metric-label">
                    Comprimento
                  </span>
                  <strong className="vessel-details-delete-modal__metric-value vessel-details-tabular">
                    {formatMetric(vessel.lengthOverall, "m", 1)}
                  </strong>
                </div>
                <div className="vessel-details-delete-modal__metric">
                  <span className="vessel-details-delete-modal__metric-label">
                    Conveses
                  </span>
                  <strong className="vessel-details-delete-modal__metric-value vessel-details-tabular">
                    {vessel.deckCount ?? 0}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="vessel-details-delete-modal__warning">
          <i className="pi pi-exclamation-triangle" aria-hidden="true" />
          <span>
            Confira a embarcação selecionada antes de confirmar a remoção.
          </span>
        </div>

        {/* CAMPO DE CONFIRMAÇÃO */}
        <Input
          id="delete-vessel-confirmation"
          label={`Digite "${vessel.vesselName}" para confirmar`}
          value={deleteConfirmation}
          onChange={(event) => onDeleteConfirmationChange(event.target.value)}
          placeholder="Nome da embarcação"
        />
      </div>
    </Modal>
  );
}
