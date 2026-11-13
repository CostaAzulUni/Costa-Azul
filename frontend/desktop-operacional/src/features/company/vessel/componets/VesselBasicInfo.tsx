import { useRef, type ChangeEvent } from "react";
import { Button, Input, SectionCard, Select } from "../../../../components";
import { VESSEL_FLAG_OPTIONS, type VesselFieldErrors, type VesselFieldKey, type VesselFormData } from "../form";

export interface VesselBasicInfoProps {
  formData: VesselFormData;
  errors: VesselFieldErrors;
  onFieldChange: <K extends VesselFieldKey>(
    field: K,
    value: VesselFormData[K]
  ) => void;
  photoFile: File | null;
  photoPreview: string | null;
  onPhotoChange: (file: File | null, preview: string | null) => void;
}

export function VesselBasicInfo({
  formData,
  errors,
  onFieldChange,
  photoFile,
  photoPreview,
  onPhotoChange,
}: VesselBasicInfoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onPhotoChange(file, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    onPhotoChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleYearBuiltChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    onFieldChange("yearBuilt", raw === "" ? null : Number(raw));
  };

  const photoFileName = photoFile
    ? photoFile.name
    : "Nenhuma imagem selecionada";
  const photoFileDetails = photoFile
    ? `${(photoFile.size / (1024 * 1024)).toFixed(1).replace(".", ",")} MB · pré-visualização local`
    : "JPG ou PNG · 2560 × 1440 px recomendado";

  return (
    <div className="vessel-step-stack">
      <SectionCard
        title="Informações básicas"
        subtitle="Identificação legal e de registro da embarcação"
        icon="pi-compass"
      >
        <div className="vessel-form-grid">
          <Input
            id="vesselName"
            label="Nome oficial da embarcação"
            required
            size="lg"
            value={formData.vesselName}
            errorMessage={errors.vesselName}
            onChange={(e) => onFieldChange("vesselName", e.target.value)}
            placeholder="Ex.: Aurora Austral"
          />

          <Input
            id="companyOwner"
            label="Empresa responsável"
            isAutomatic
            readOnly
            disabled
            size="lg"
            placeholder="Costa Azul Cruzeiros"
            helperText="Definida pela empresa do seu login."
          />

          <Input
            id="nationalRegistrationNumber"
            label="Número do registro nacional"
            required
            size="lg"
            value={formData.nationalRegistrationNumber}
            errorMessage={errors.nationalRegistrationNumber}
            onChange={(e) =>
              onFieldChange("nationalRegistrationNumber", e.target.value)
            }
            placeholder="Ex.: 704512983"
            helperText="Registro na Capitania dos Portos / Tribunal Marítimo."
          />

          <Select
            id="flag"
            label="Bandeira"
            required
            size="lg"
            value={formData.flag}
            errorMessage={errors.flag}
            options={VESSEL_FLAG_OPTIONS}
            onChange={(e) => onFieldChange("flag", e.target.value)}
            placeholder="Selecione a bandeira"
          />

          <Input
            id="imoNumber"
            label="Número IMO"
            required
            size="lg"
            maxLength={7}
            inputMode="numeric"
            value={formData.imoNumber}
            errorMessage={errors.imoNumber}
            onChange={(e) =>
              onFieldChange("imoNumber", e.target.value.replace(/\D/g, ""))
            }
            placeholder="Ex.: 9876543"
            helperText="7 dígitos numéricos · disponível na sua frota."
          />

          <Input
            id="yearBuilt"
            label="Ano de fabricação"
            required
            size="lg"
            type="number"
            min={1900}
            max={2100}
            value={formData.yearBuilt ?? ""}
            errorMessage={errors.yearBuilt}
            onChange={handleYearBuiltChange}
            placeholder="Ex.: 2018"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Foto da embarcação"
        subtitle="Opcional · 2560 × 1440 px recomendado (JPG ou PNG)"
        icon="pi-image"
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          className="vessel-hidden-input"
        />

        <div className="vessel-photo-row">
          <button
            type="button"
            className="vessel-photo-thumb"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Selecionar foto da embarcação"
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Pré-visualização da embarcação"
                className="vessel-photo-thumb__img"
              />
            ) : (
              <i
                className="pi pi-compass vessel-photo-thumb__icon"
                aria-hidden="true"
              />
            )}
          </button>

          <div className="vessel-photo-info">
            <span className="vessel-photo-info__name">{photoFileName}</span>
            <span className="vessel-photo-info__meta">{photoFileDetails}</span>

            <div className="vessel-photo-info__actions">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon="pi-upload"
                onClick={() => fileInputRef.current?.click()}
              >
                {photoPreview ? "Substituir imagem" : "Selecionar imagem"}
              </Button>

              {photoPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePhoto}
                >
                  Remover
                </Button>
              )}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
