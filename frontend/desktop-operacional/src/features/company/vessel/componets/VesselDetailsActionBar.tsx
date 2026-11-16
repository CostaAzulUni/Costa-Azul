import { Button } from "../../../../components";
import type { VesselFieldErrors } from "../form";

export interface VesselDetailsActionBarProps {
  isEditing: boolean;
  isSaving: boolean;
  editErrors: VesselFieldErrors;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onExportSheet: () => void;
  onOpenDeleteModal: () => void;
}

export function VesselDetailsActionBar({
  isEditing,
  isSaving,
  editErrors,
  onCancelEdit,
  onSaveEdit,
  onExportSheet,
  onOpenDeleteModal,
}: VesselDetailsActionBarProps) {
  const errorCount = Object.keys(editErrors).length;

  if (isEditing) {
    return (
      <div className="vessel-details-edit-bar">
        <div className="vessel-details-edit-bar__status">
          {errorCount > 0 ? (
            <>
              <i
                className="pi pi-times-circle vessel-details-edit-bar__icon--error"
                aria-hidden="true"
              />
              <span className="vessel-details-edit-bar__text--error">
                Corrija {errorCount} {errorCount === 1 ? "campo" : "campos"}{" "}
                para salvar.
              </span>
            </>
          ) : (
            <>
              <span
                className="vessel-details-edit-bar__dot"
                aria-hidden="true"
              />
              <span>Modo edição ativo · revise os campos alterados</span>
            </>
          )}
        </div>

        <div className="vessel-details-edit-bar__actions">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancelEdit}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            icon="pi-check"
            disabled={isSaving}
            onClick={onSaveEdit}
          >
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="vessel-details-footer-actions">
      <Button
        type="button"
        variant="secondary"
        size="md"
        icon="pi-download"
        onClick={onExportSheet}
      >
        Exportar ficha
      </Button>
      <Button
        type="button"
        variant="danger"
        size="md"
        icon="pi-trash"
        onClick={onOpenDeleteModal}
      >
        Remover embarcação
      </Button>
    </div>
  );
}
