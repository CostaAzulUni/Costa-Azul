import { Badge, Button } from "../../../../components";
import type { PrototypeSectionSummary } from "../utils";

export interface VesselSectionIndexProps {
  vesselName: string;
  sectionSummaries: PrototypeSectionSummary[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onClose: () => void;
}

export function VesselSectionIndex({
  vesselName,
  sectionSummaries,
  activeTab,
  onSelectTab,
  onClose,
}: VesselSectionIndexProps) {
  return (
    <section
      className="vessel-details-index-card"
      aria-label="Índice rápido das seções da embarcação"
    >
      <div className="vessel-details-index-card__header">
        <div>
          <span className="vessel-details-index-card__eyebrow">
            ÍNDICE DE NAVEGAÇÃO DA FICHA
          </span>
          <h2 className="vessel-details-index-card__title">
            Seções da página de detalhe ({vesselName})
          </h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon="pi-times"
          onClick={onClose}
        >
          Fechar
        </Button>
      </div>

      <div className="vessel-details-index-grid">
        {sectionSummaries.map((item) => {
          const isCurrent = activeTab === item.tabId;
          return (
            <button
              key={item.tabId}
              type="button"
              className={`vessel-details-index-item ${
                isCurrent ? "vessel-details-index-item--active" : ""
              }`}
              onClick={() => onSelectTab(item.tabId)}
            >
              <div className="vessel-details-index-item__top">
                <span className="vessel-details-index-item__num">
                  {item.code}
                </span>
                <Badge tone={isCurrent ? "info" : "neutral"} size="sm">
                  {item.badgeText}
                </Badge>
              </div>
              <strong className="vessel-details-index-item__title">
                {item.title}
              </strong>
              <span className="vessel-details-index-item__desc">
                {item.description}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
