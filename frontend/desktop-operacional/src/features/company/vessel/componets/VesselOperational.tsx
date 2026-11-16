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
          label="Porto base (ID UUID)"
          size="lg"
          value={formData.idHomePort}
          errorMessage={errors.idHomePort}
          onChange={(e) => onFieldChange("idHomePort", e.target.value)}
          placeholder="Opcional · aguarda listagem do módulo Portos"
          helperText="Deixe em branco ou informe o UUID do porto cadastrado."
        />

        <Input
          id="mainTerminal"
          label="Terminal / berço principal"
          size="lg"
          value={formData.mainTerminal}
          errorMessage={errors.mainTerminal}
          onChange={(e) => onFieldChange("mainTerminal", e.target.value)}
          placeholder="Ex.: Berço 02 · Cais Outeirinhos"
        />

        <Input
          id="idManager"
          label="Gerente da embarcação (ID UUID)"
          size="lg"
          value={formData.idManager}
          errorMessage={errors.idManager}
          onChange={(e) => onFieldChange("idManager", e.target.value)}
          placeholder="Opcional · aguarda listagem do módulo Pessoas"
          helperText="Deixe em branco ou informe o UUID do funcionário responsável."
        />

        <Input
          id="operationalEmail"
          label="E-mail operacional"
          required
          size="lg"
          type="email"
          value={formData.operationalEmail}
          errorMessage={errors.operationalEmail}
          onChange={(e) => onFieldChange("operationalEmail", e.target.value)}
          placeholder="operacoes@auroraaustral.com.br"
        />
      </div>
    </SectionCard>
  );
}
