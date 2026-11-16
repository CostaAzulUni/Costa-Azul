
import type { VesselFormData } from "../form";
import type {
  DocumentDTO,
  VesselRequestDTO,
  VesselResponseDTO,
} from "../../../../services/vesselcreate";

export function buildVesselPayload(
  formData: VesselFormData,
  documents: File[],
  photoFile: File | null
): VesselRequestDTO {
  const mappedDocuments: DocumentDTO[] = documents.map((file) => ({
    documentType: "TECHNICAL_DOCUMENT",
    fileName: file.name,
    fileUrl: `pending-upload://${encodeURIComponent(file.name)}`,
    mimeType: file.type || "application/octet-stream",
    fileSizeBytes: file.size,
  }));

  return {
    idCompany: null,
    vesselName: formData.vesselName.trim(),
    nationalRegistrationNumber: formData.nationalRegistrationNumber.trim(),
    flag: formData.flag,
    imoNumber: formData.imoNumber.trim(),
    photoUrl: photoFile ? photoFile.name : null,
    yearBuilt: formData.yearBuilt,
    shipyard: formData.shipyard.trim(),
    grossTonnage: formData.grossTonnage,
    deadweightTonnage: formData.deadweightTonnage,
    lengthOverall: formData.lengthOverall,
    maxBeam: formData.maxBeam,
    operatingDraft: formData.operatingDraft,
    maxServiceSpeed: formData.maxServiceSpeed,
    mainPropulsion: formData.mainPropulsion,
    maxPassengerCapacity: formData.maxPassengerCapacity,
    maxCrewCapacity: formData.maxCrewCapacity,
    lifeboatTotalCapacity: formData.lifeboatTotalCapacity,
    classificationSociety: formData.classificationSociety,
    ismCertification: formData.ismCertification.trim(),
    certificateExpiryDate: formData.certificateExpiryDate || null,
    operationalStatus: formData.operationalStatus,
    idHomePort: formData.idHomePort.trim() || null,
    mainTerminal: formData.mainTerminal.trim(),
    idManager: formData.idManager.trim() || null,
    operationalEmail: formData.operationalEmail.trim(),
    documents: mappedDocuments,
  };
}

export function buildVesselUpdatePayload(
  vessel: VesselResponseDTO,
  editFormData: VesselFormData
): VesselRequestDTO {
  return {
    idCompany: vessel.idCompany ?? null,
    vesselName: editFormData.vesselName.trim(),
    nationalRegistrationNumber:
      editFormData.nationalRegistrationNumber.trim(),
    flag: editFormData.flag,
    imoNumber: editFormData.imoNumber.trim(),
    photoUrl: vessel.photoUrl ?? null,
    yearBuilt: editFormData.yearBuilt,
    shipyard: editFormData.shipyard.trim(),
    grossTonnage: editFormData.grossTonnage,
    deadweightTonnage: editFormData.deadweightTonnage,
    lengthOverall: editFormData.lengthOverall,
    maxBeam: editFormData.maxBeam,
    operatingDraft: editFormData.operatingDraft,
    maxServiceSpeed: editFormData.maxServiceSpeed,
    mainPropulsion: editFormData.mainPropulsion,
    maxPassengerCapacity: editFormData.maxPassengerCapacity,
    maxCrewCapacity: editFormData.maxCrewCapacity,
    lifeboatTotalCapacity: editFormData.lifeboatTotalCapacity,
    classificationSociety: editFormData.classificationSociety,
    ismCertification: editFormData.ismCertification.trim(),
    certificateExpiryDate: editFormData.certificateExpiryDate || null,
    operationalStatus: editFormData.operationalStatus,
    idHomePort: editFormData.idHomePort.trim() || null,
    mainTerminal: editFormData.mainTerminal.trim(),
    idManager: editFormData.idManager.trim() || null,
    operationalEmail: editFormData.operationalEmail.trim(),
    documents: [],
  };
}

