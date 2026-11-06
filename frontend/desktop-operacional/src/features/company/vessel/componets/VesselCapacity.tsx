import type { ChangeEvent } from "react";
import { Alert, Input, SectionCard } from "../../../../components";
import type {
  VesselFieldErrors,
  VesselFieldKey,
  VesselFormData,
} from "../vesselFormConfig";

export interface VesselCapacityProps {
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

export function VesselCapacity({
  formData,
  errors,
  onFieldChange,
}: VesselCapacityProps) {
  return (
    <div className="vessel-step-stack">
      <SectionCard
        title="Capacidade e acomodação"
        subtitle="Limites homologados de pessoas a bordo"
        icon="pi-users"
      >
        <div className="vessel-form-grid">
          <Input
            id="maxPassengerCapacity"
            label="Capacidade máxima de passageiros"
            required
            size="lg"
            type="number"
            min={1}
            step={1}
            unitSuffix="pessoas"
            value={formData.maxPassengerCapacity ?? ""}
            errorMessage={errors.maxPassengerCapacity}
            onChange={(e) =>
              onFieldChange("maxPassengerCapacity", parseNullableNumber(e))
            }
            placeholder="2.900"
          />

          <Input
            id="maxCrewCapacity"
            label="Capacidade máxima de tripulantes"
            required
            size="lg"
            type="number"
            min={0}
            step={1}
            unitSuffix="pessoas"
            value={formData.maxCrewCapacity ?? ""}
            errorMessage={errors.maxCrewCapacity}
            onChange={(e) =>
              onFieldChange("maxCrewCapacity", parseNullableNumber(e))
            }
            placeholder="1.100"
          />

          <Input
            id="totalCabins"
            label="Total de cabines"
            isAutomatic
            readOnly
            disabled
            size="lg"
            placeholder="Calculado após cadastrar cabines"
          />

          <Input
            id="lifeboatTotalCapacity"
            label="Botes salva-vidas / capacidade de pessoas"
            required
            size="lg"
            type="number"
            min={1}
            step={1}
            unitSuffix="pessoas"
            value={formData.lifeboatTotalCapacity ?? ""}
            errorMessage={errors.lifeboatTotalCapacity}
            onChange={(e) =>
              onFieldChange("lifeboatTotalCapacity", parseNullableNumber(e))
            }
            placeholder="4.200"
            helperText="Deve ser igual ou superior à soma de passageiros e tripulantes."
          />
        </div>
      </SectionCard>

      <Alert
        variant="info"
        title="Regra de segurança SOLAS"
        description="A capacidade total de botes salva-vidas deve ser igual ou superior à soma de passageiros e tripulantes homologados."
      />
    </div>
  );
}
