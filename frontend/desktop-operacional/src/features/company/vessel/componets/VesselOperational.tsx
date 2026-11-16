import { Input, SectionCard } from "../../../../components";
import { type VesselFieldErrors, type VesselFieldKey, type VesselFormData } from "../form";

export interface VesselOperationalProps {
  formData: VesselFormData;
  errors: VesselFieldErrors;
  onFieldChange: <K extends VesselFieldKey>(
    field: K,
    value: VesselFormData[K]
  ) => void;
}

export function VesselOperational({
  formData,
  errors,
  onFieldChange,
}: VesselOperationalProps) {
  return (
    <SectionCard title="Base operacional e gestão" icon="pi-map-marker">
      <div className="vessel-form-grid">
        <Input
          id="idHomePort"
          label="Porto base"
          size="lg"
          disabled
          readOnly
          value={formData.idHomePort}
          errorMessage={errors.idHomePort}
          placeholder="Indisponível · aguarda módulo de Portos"
          helperText="A seleção de porto base estará disponível posteriormente."
        />

        <Input
          id="mainTerminal"
          label="Terminal / berço principal"
          size="lg"
          maxLength={100}
          value={formData.mainTerminal}
          errorMessage={errors.mainTerminal}
          onChange={(e) => onFieldChange("mainTerminal", e.target.value)}
          onBlur={(e) => onFieldChange("mainTerminal", e.target.value.trim().replace(/\s+/g, " "))}
          placeholder="Ex.: Terminal Concais · Berço 3"
          helperText="Opcional · até 100 caracteres."
        />

        <Input
          id="idManager"
          label="Gerente da embarcação"
          size="lg"
          disabled
          readOnly
          value={formData.idManager}
          errorMessage={errors.idManager}
          placeholder="Indisponível · aguarda módulo de Pessoas"
          helperText="A seleção de gerente responsável estará disponível posteriormente."
        />

        <Input
          id="operationalEmail"
          label="E-mail operacional"
          required
          size="lg"
          type="email"
          maxLength={255}
          value={formData.operationalEmail}
          errorMessage={errors.operationalEmail}
          onChange={(e) => onFieldChange("operationalEmail", e.target.value)}
          placeholder="operacoes@auroraaustral.com.br"
        />
      </div>
    </SectionCard>
  );
}
