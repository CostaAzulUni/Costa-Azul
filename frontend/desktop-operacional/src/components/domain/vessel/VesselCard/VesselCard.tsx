import { Badge } from "../../../ui/Badge/Badge";
import { Button } from "../../../ui/Button/Button";
import { Icon, type IconSource } from "../../../ui/Icon/Icon";
import { cx } from "../../../ui/utils/cx";
import type { DomainMetric, DomainStatus } from "../types";
import "./VesselCard.css";

export interface VesselCardTrip {
  /** Ex.: "Santos → Ilhabela". */
  route: string;
  /** Progresso da viagem de 0 a 100. */
  progress: number;
  /** Ex.: "Chegada prevista 18:40". */
  eta?: string;
}

export interface VesselCardIdleInfo {
  text: string;
  icon?: IconSource;
}

export interface VesselCardProps {
  name: string;
  /** Linha secundária (ex.: nome da empresa). */
  subtitle?: string;
  imo?: string;
  photoUrl?: string;
  status: DomainStatus;
  /** Números-chave (Figma: Passageiros, Conveses, Tripulação). */
  metrics?: DomainMetric[];
  /** Variante "Com viagem". */
  trip?: VesselCardTrip;
  /** Variante "Sem viagem" (ex.: "Atracado no porto base"). Ignorado se houver `trip`. */
  idleInfo?: VesselCardIdleInfo;
  compliance?: DomainStatus;
  onOpen?: () => void;
  openLabel?: string;
  className?: string;
}

export function VesselCard({
  name,
  subtitle,
  imo,
  photoUrl,
  status,
  metrics = [],
  trip,
  idleInfo,
  compliance,
  onOpen,
  openLabel = "Abrir ficha",
  className,
}: VesselCardProps) {
  // Garante que valores fora do intervalo não quebrem a barra de progresso
  const progress = trip ? Math.min(100, Math.max(0, Math.round(trip.progress))) : 0;

  return (
    <article className={cx("vessel-card", className)}>
      <div className="vessel-card__media">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="vessel-card__image" />
        ) : (
          <div className="vessel-card__placeholder" aria-hidden="true">
            <i className="pi pi-image" />
          </div>
        )}
        <Badge tone={status.tone} className="vessel-card__status">
          {status.label}
        </Badge>
      </div>

      <div className="vessel-card__body">
        <div className="vessel-card__identity">
          <h3 className="vessel-card__name">{name}</h3>
          {(subtitle || imo) && (
            <p className="vessel-card__subtitle">
              {subtitle}
              {subtitle && imo && " · "}
              {imo && <span className="vessel-card__imo">IMO {imo}</span>}
            </p>
          )}
        </div>

        {metrics.length > 0 && (
          <dl className="vessel-card__metrics">
            {metrics.map((metric) => (
              <div key={metric.label} className="vessel-card__metric">
                <dt>{metric.label}</dt>
                <dd>{metric.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {trip ? (
          <div className="vessel-card__trip">
            <div className="vessel-card__trip-header">
              <span className="vessel-card__trip-route">
                <i className="pi pi-directions" aria-hidden="true" />
                {trip.route}
              </span>
              <span className="vessel-card__trip-progress">{progress}%</span>
            </div>
            {/* role="progressbar" + aria-valuenow tornam a barra compreensível para leitores de tela */}
            <div
              className="vessel-card__bar"
              role="progressbar"
              aria-label={`Progresso da viagem ${trip.route}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
            {trip.eta && <span className="vessel-card__trip-eta">{trip.eta}</span>}
          </div>
        ) : (
          idleInfo && (
            <div className="vessel-card__idle">
              <Icon icon={idleInfo.icon ?? "pi-map-marker"} className="vessel-card__idle-icon" />
              <span>{idleInfo.text}</span>
            </div>
          )
        )}
      </div>

      {(compliance || onOpen) && (
        <footer className="vessel-card__footer">
          {compliance ? (
            <Badge tone={compliance.tone}>{compliance.label}</Badge>
          ) : (
            <span />
          )}
          {onOpen && (
            <Button
              variant="ghost"
              size="sm"
              icon="pi-arrow-right"
              iconPosition="right"
              onClick={onOpen}
              aria-label={`${openLabel} de ${name}`}
            >
              {openLabel}
            </Button>
          )}
        </footer>
      )}
    </article>
  );
}
