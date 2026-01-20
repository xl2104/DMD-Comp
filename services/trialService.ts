import { ClinicalTrial } from '../types';

const BASE_URL = 'https://clinicaltrials.gov/api/v2/studies';

const detectRegions = (locations: any[] = []): string[] => {
  const regions = new Set<string>();
  const locString = JSON.stringify(locations).toLowerCase();
  
  if (locString.includes('china') || locString.includes('japan') || locString.includes('korea') || locString.includes('taiwan')) regions.add('亚洲');
  if (locString.includes('united states') || locString.includes('canada')) regions.add('北美洲');
  if (locString.includes('france') || locString.includes('germany') || locString.includes('united kingdom') || locString.includes('italy') || locString.includes('spain')) regions.add('欧洲');
  if (locString.includes('australia') || locString.includes('zealand')) regions.add('大洋洲');
  if (locString.includes('brazil') || locString.includes('argentina')) regions.add('南美洲');
  
  return Array.from(regions);
};

export const fetchDmdTrials = async (): Promise<ClinicalTrial[]> => {
  try {
    const query = encodeURIComponent('Duchenne Muscular Dystrophy');
    const statusFilter = 'RECRUITING|ENROLLING_BY_INVITATION|ACTIVE_NOT_RECRUITING';
    const url = `${BASE_URL}?query.cond=${query}&filter.overallStatus=${statusFilter}&pageSize=25`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch trials');
    const data = await response.json();

    return data.studies.map((s: any) => {
      const protocol = s.protocolSection;
      const locations = protocol.contactsLocationsModule?.locations || [];
      return {
        nctId: protocol.identificationModule.nctId,
        title: protocol.identificationModule.officialTitle || protocol.identificationModule.briefTitle,
        status: protocol.statusModule.overallStatus,
        phase: protocol.designModule?.phases || [],
        conditions: protocol.conditionsModule?.conditions || [],
        locations: locations.map((l: any) => l.facility),
        regions: detectRegions(locations),
        summary: protocol.descriptionModule?.briefSummary || "",
        eligibility: protocol.eligibilityModule?.eligibilityCriteria || "",
        lastUpdate: protocol.statusModule.lastUpdatePostDateStruct?.date || ""
      };
    });
  } catch (error) {
    console.error("ClinicalTrials Error:", error);
    return [];
  }
};