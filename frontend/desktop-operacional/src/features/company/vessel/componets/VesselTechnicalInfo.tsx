import type { ChangeEvent } from "react";
import { Input, SectionCard, Select } from "../../../../components";
import { PROPULSION_TYPE_OPTIONS, type VesselFieldErrors, type VesselFieldKey, type VesselFormData } from "../form";

export interface VesselTechnicalInfoProps {
  formData: VesselFormData;
  errors: VesselFieldErrors;
  onFieldChange: <K extends VesselFieldKey>(
    field: K,
    value: VesselFormData[K]
  ) => void;
}

function parseNullableNumber(
  event: ChangeEvent<HTMLInputElement>
): number | null {
  const raw = event.target.value;
  return raw === "" ? null : Number(raw);
}

export function VesselTechnicalInfo({
  formData,
  errors,
  onFieldChange,
}: VesselTechnicalInfoProps) {
  return (
    <div className="vessel-step-stack">
      <SectionCard
        title="Dimensões e tonelagem"
        subtitle="Medidas principais do casco"
        icon="pi-sliders-h"
      >
        <div className="vessel-form-grid vessel-form-grid--3cols">
          <Input
            id="grossTonnage"
            label="Arqueação bruta (GT)"
            required
            size="lg"
            type="number"
            min={0.01}
            step="0.01"
            unitSuffix="GT"
            value={formData.grossTonnage ?? ""}
            errorMessage={errors.grossTonnage}
            onChange={(e) =>
              onFieldChange("grossTonnage", parseNullableNumber(e))
            }
            placeholder="98.500"
          />

          <Input
            id="lengthOverall"
            label="Comprimento total (LOA)"
            required
            size="lg"
            type="number"
            min={0.01}
            step="0.01"
            unitSuffix="m"
            value={formData.lengthOverall ?? ""}
            errorMessage={errors.lengthOverall}
            onChange={(e) =>
              onFieldChange("lengthOverall", parseNullableNumber(e))
            }
            placeholder="294,0"
          />

          <Input
            id="operatingDraft"
            label="Calado operacional"
            required
            size="lg"
            type="number"
            min={0.01}
            step="0.01"
            unitSuffix="m"
            value={formData.operatingDraft ?? ""}
            errorMessage={errors.operatingDraft}
            onChange={(e) =>
              onFieldChange("operatingDraft", parseNullableNumber(e))
            }
            placeholder="8,4"
          />

          <Input
            id="maxBeam"
            label="Boca máxima"
            size="lg"
            type="number"
            min={0.01}
            step="0.01"
            unitSuffix="m"
            value={formData.maxBeam ?? ""}
            errorMessage={errors.maxBeam}
            onChange={(e) => onFieldChange("maxBeam", parseNullableNumber(e))}
            placeholder="32,2"
          />

          <Input
            id="deadweightTonnage"
            label="Porte bruto (DWT)"
            size="lg"
            type="number"
            min={0.01}
            step="0.01"
            unitSuffix="t"
            value={formData.deadweightTonnage ?? ""}
            errorMessage={errors.deadweightTonnage}
            onChange={(e) =>
              onFieldChange("deadweightTonnage", parseNullableNumber(e))
            }
            placeholder="11.200"
          />
        </div>
      </SectionCard>

      <SectionCard title="Construção e propulsão" icon="pi-wrench">
        <div className="vessel-form-grid">
          <Input
            id="shipyard"
            label="Estaleiro construtor"
            required
            size="lg"
            value={formData.shipyard}
            errorMessage={errors.shipyard}
            onChange={(e) => onFieldChange("shipyard", e.target.value)}
            placeholder="Ex.: Fincantieri — Monfalcone, Itália"
          />

          <Input
            id="maxServiceSpeed"
            label="Velocidade máxima de serviço"
            size="lg"
            type="number"
            min={0.1}
            step="0.1"
            unitSuffix="nós"
            value={formData.maxServiceSpeed ?? ""}
            errorMessage={errors.maxServiceSpeed}
            onChange={(e) =>
              onFieldChange("maxServiceSpeed", parseNullableNumber(e))
            }
            placeholder="21,5"
          />

          <Select
            id="mainPropulsion"
            label="Propulsão principal"
            size="lg"
            value={formData.mainPropulsion}
            errorMessage={errors.mainPropulsion}
            options={PROPULSION_TYPE_OPTIONS}
            onChange={(e) => onFieldChange("mainPropulsion", e.target.value)}
            placeholder="Selecione o sistema"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Estrutura"
        subtitle="Calculado a partir dos conveses e áreas cadastrados depois"
        icon="pi-sitemap"
      >
        <div className="vessel-form-grid">
          <Input
            id="decksCount"
            label="Número de conveses"
            isAutomatic
            readOnly
            disabled
            size="lg"
            placeholder="Calculado após cadastrar conveses"
          />

          <Input
            id="areasCount"
            label="Número de áreas"
            isAutomatic
            readOnly
            disabled
            size="lg"
            placeholder="Calculado após cadastrar áreas"
          />
        </div>
      </SectionCard>
    </div>
  );
}
