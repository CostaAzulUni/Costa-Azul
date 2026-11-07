import api from "./api";

export interface VesselRequestDTO {
    idCompany: string | null;
    vesselName: string;
    nationalRegistrationNumber: string;
    flag: string;
    imoNumber: string;
    photoUrl: string | null;
    yearBuilt: number | null;
    shipyard: string;
    grossTonnage: number | null;
    deadweightTonnage: number | null;
    lengthOverall: number | null;
    maxBeam: number | null;
    operatingDraft: number | null;
    maxServiceSpeed: number | null;
    mainPropulsion: string;
    maxPassengerCapacity: number | null;
    maxCrewCapacity: number | null;
    lifeboatTotalCapacity: number | null;
    classificationSociety: string;
    ismCertification: string;
    certificateExpiryDate: string | null;
    operationalStatus: string;
    idHomePort: string | null;
    mainTerminal: string;
    idManager: string | null;
    operationalEmail: string;
    documents: DocumentDTO[];
}

export interface DocumentDTO {
    documentType: string;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    fileSizeBytes: number;
}

export interface VesselResponseDTO {
    idVessel: string;
    idCompany: string;
    companyName: string;
    vesselName: string;
    nationalRegistrationNumber: string;
    flag: string;
    imoNumber: string;
    photoUrl: string | null;
    yearBuilt: number;
    shipyard: string;
    grossTonnage: number;
    deadweightTonnage: number | null;
    lengthOverall: number;
    maxBeam: number | null;
    operatingDraft: number | null;
    maxServiceSpeed: number | null;
    mainPropulsion: string | null;
    maxPassengerCapacity: number;
    maxCrewCapacity: number | null;
    lifeboatTotalCapacity: number | null;
    classificationSociety: string | null;
    ismCertification: string | null;
    certificateExpiryDate: string | null;
    operationalStatus: string;
    idHomePort: string | null;
    mainTerminal: string | null;
    idManager: string | null;
    operationalEmail: string | null;
    deckCount: number;
    cabinCount: number;
    totalAreas: number;
    createdAt: string;
}

export async function createVessel(vessel: VesselRequestDTO): Promise<VesselResponseDTO> {
    const response = await api.post<VesselResponseDTO>("/api/erp/vessels", vessel);

    return response.data;
}

export async function listVessels(): Promise<VesselResponseDTO[]> {
    const response = await api.get<VesselResponseDTO[]>("/api/erp/vessels");

    return response.data;
}
