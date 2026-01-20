import { FDADrug } from '../types';

const FALLBACK_DRUGS: FDADrug[] = [
  { 
    brandName: "Elevidys", 
    brandNameCn: "依力维迪",
    genericName: "delandistrogene moxeparvovec-rokl", 
    genericNameCn: "德兰替隆基因",
    manufacturer: "Sarepta Therapeutics", 
    approvalDate: "2023-06", 
    approvalYear: "2023",
    indication: "用于治疗携带DMD基因确证突变的4岁及以上杜氏肌营养不良（DMD）患者（2024年6月扩大了标签，包括非行走患者）。", 
    dosage: "单次静脉注射。剂量为 1.33 x 10^14 载体基因组/kg。",
    labelUrl: "https://www.fda.gov/vaccines-blood-biologics/elevidys" 
  },
  { 
    brandName: "Duvyzat", 
    brandNameCn: "杜微扎特",
    genericName: "givinostat", 
    genericNameCn: "吉维诺他",
    manufacturer: "Italfarmaco", 
    approvalDate: "2024-03", 
    approvalYear: "2024",
    indication: "用于治疗6岁及以上的DMD患者。首个获批的非甾体类组蛋白去乙酰化酶（HDAC）抑制剂。", 
    dosage: "口服混悬液，每日两次，随餐服用。剂量基于患者体重。",
    labelUrl: "https://www.fda.gov/drugs/drug-approvals-and-databases/fda-approves-non-steroidal-treatment-duchenne-muscular-dystrophy" 
  },
  { 
    brandName: "Agamree", 
    brandNameCn: "阿加瑞",
    genericName: "vamorolone", 
    genericNameCn: "瓦莫洛隆",
    manufacturer: "Santhera Pharmaceuticals", 
    approvalDate: "2023-10", 
    approvalYear: "2023",
    indication: "用于治疗2岁及以上的DMD患者。旨在减少传统类固醇的副作用。", 
    dosage: "每日口服一次，建议剂量为6 mg/kg/天。",
    labelUrl: "https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-vamorolone-duchenne-muscular-dystrophy" 
  },
  { 
    brandName: "Exondys 51", 
    brandNameCn: "埃特利森",
    genericName: "eteplirsen", 
    manufacturer: "Sarepta Therapeutics", 
    approvalDate: "2016-09", 
    approvalYear: "2016",
    indication: "首个获批的外显子跳跃药物，适用于经确认适合外显子51跳跃治疗的DMD患者。", 
    dosage: "每周一次，30 mg/kg，静脉输注。",
    labelUrl: "https://www.fda.gov/news-events/press-announcements/fda-grants-accelerated-approval-first-drug-duchenne-muscular-dystrophy" 
  },
  { 
    brandName: "Vyondys 53", 
    brandNameCn: "维昂迪斯 53",
    genericName: "golodirsen", 
    manufacturer: "Sarepta Therapeutics", 
    approvalDate: "2019-12", 
    approvalYear: "2019",
    indication: "适用于经确认适合外显子53跳跃治疗的DMD患者。", 
    dosage: "每周一次，30 mg/kg，静脉输注。",
    labelUrl: "https://www.fda.gov" 
  },
  { 
    brandName: "Viltepso", 
    brandNameCn: "维特普索",
    genericName: "viltolarsen", 
    manufacturer: "NS Pharma", 
    approvalDate: "2020-08", 
    approvalYear: "2020",
    indication: "适用于经确认适合外显子53跳跃治疗的DMD患者。", 
    dosage: "每周一次，80 mg/kg，静脉输注。",
    labelUrl: "https://www.fda.gov" 
  },
  { 
    brandName: "Amondys 45", 
    genericName: "casimersen", 
    manufacturer: "Sarepta Therapeutics", 
    approvalDate: "2021-02", 
    approvalYear: "2021",
    indication: "适用于经确认适合外显子45跳跃治疗的DMD患者。", 
    dosage: "每周一次，30 mg/kg，静脉输注。",
    labelUrl: "https://www.fda.gov" 
  },
  { 
    brandName: "Emflaza", 
    brandNameCn: "恩氟扎",
    genericName: "deflazacort", 
    manufacturer: "PTC Therapeutics", 
    approvalDate: "2017-02", 
    approvalYear: "2017",
    indication: "用于治疗2岁及以上的DMD患者。属于皮质类固醇。", 
    dosage: "每日口服一次，约为0.9 mg/kg/天。",
    labelUrl: "https://www.fda.gov" 
  }
];

export const fetchDmdDrugs = async (): Promise<FDADrug[]> => {
  // English names are primary and always provided in this curated list.
  return FALLBACK_DRUGS;
};