import { useRef, type ChangeEvent } from "react";
import { Badge, IconButton, SectionCard } from "../../../../components";

export interface VesselDocumentsProps {
  documents: File[];
  onDocumentsChange: (documents: File[]) => void;
}

export function VesselDocuments({
  documents,
  onDocumentsChange,
}: VesselDocumentsProps) {
  const docInputRef = useRef<HTMLInputElement>(null);

  const handleDocumentUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      onDocumentsChange([...documents, ...filesArray]);
      event.target.value = "";
    }
  };

  const removeDocument = (indexToRemove: number) => {
    onDocumentsChange(documents.filter((_, index) => index !== indexToRemove));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
    }
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  };

  return (
    <SectionCard
      title="Documentação técnica"
      subtitle="Certificado de classe, plano geral, inscrição e outros documentos"
      icon="pi-file"
    >
      <div className="vessel-docs-container">
        <input
          type="file"
          multiple
          accept=".pdf,.dwg,image/*"
          ref={docInputRef}
          onChange={handleDocumentUpload}
          className="vessel-hidden-input"
        />

        <button
          type="button"
          className="vessel-dropzone"
          onClick={() => docInputRef.current?.click()}
        >
          <span className="vessel-dropzone__icon-box">
            <i className="pi pi-upload" aria-hidden="true" />
          </span>
          <span className="vessel-dropzone__title">
            Arraste arquivos ou clique para enviar
          </span>
          <span className="vessel-dropzone__hint">
            PDF, DWG ou imagem · metadados registrados no cadastro
          </span>
        </button>

        <div className="vessel-doc-list">
          {documents.map((doc, index) => (
            <div key={`${doc.name}-${index}`} className="vessel-doc-item">
              <div className="vessel-doc-item__info">
                <span className="vessel-doc-item__icon-box">
                  <i className="pi pi-file" aria-hidden="true" />
                </span>
                <div className="vessel-doc-item__meta">
                  <span className="vessel-doc-item__name" title={doc.name}>
                    {doc.name}
                  </span>
                  <span className="vessel-doc-item__sub">
                    {formatFileSize(doc.size)} · pronto para envio
                  </span>
                </div>
              </div>
              <IconButton
                icon="pi-times"
                variant="ghost"
                size="sm"
                aria-label={`Remover documento ${doc.name}`}
                onClick={() => removeDocument(index)}
              />
            </div>
          ))}

          <div className="vessel-doc-item vessel-doc-item--recommended">
            <div className="vessel-doc-item__info">
              <span className="vessel-doc-item__icon-box vessel-doc-item__icon-box--muted">
                <i className="pi pi-file" aria-hidden="true" />
              </span>
              <div className="vessel-doc-item__meta">
                <span className="vessel-doc-item__name">
                  Plano geral (General Arrangement)
                </span>
                <span className="vessel-doc-item__sub">
                  Recomendado para agilizar o cadastro de conveses
                </span>
              </div>
            </div>
            <Badge
              tone={documents.length > 0 ? "success" : "warning"}
              size="sm"
            >
              {documents.length > 0 ? "Anexado" : "Pendente"}
            </Badge>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
