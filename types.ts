
export enum Region {
  ASIA = '亚洲 (Asia)',
  NORTH_AMERICA = '北美 (North America)',
  EUROPE = '欧洲 (Europe)',
  OCEANIA = '大洋洲 (Oceania)',
  SOUTH_AMERICA = '南美 (South America)',
  OTHER = '其他 (Other)'
}

export enum InterestArea {
  MEDICATIONS = '新药与临床试验',
  DAILY_CARE = '日常护理与康复',
  HEART_LUNGS = '心脏与肺部健康',
  GENE_THERAPY = '基因疗法动态',
  BASIC_SCIENCE = '基础科学研究'
}

export enum ArticleType {
  CLINICAL_TRIAL = '临床试验',
  REVIEW = '综述',
  GUIDELINE = '指南/共识',
  RESEARCH = '研究论文',
  UNKNOWN = '文章'
}

export interface UserProfile {
  isConfigured: boolean;
  age: number;
  geneticProfile: string;
  ambulatoryStatus: 'ambulatory' | 'wheelchair' | 'mixed';
  onSteroids: 'yes' | 'no' | 'unsure';
  region: Region;
  interests: InterestArea[];
  clinicalNotes: string;
}

export interface Article {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  publicationDate: string;
  journal: string;
  url: string;
  tags: ArticleType[];
}

export interface ClinicalTrial {
  nctId: string;
  title: string;
  status: string;
  phase: string[];
  conditions: string[];
  locations: string[];
  regions: string[];
  summary: string;
  eligibility: string;
  lastUpdate: string;
}

export interface FDADrug {
  brandName: string;
  brandNameCn?: string;
  genericName: string;
  genericNameCn?: string;
  manufacturer: string;
  approvalDate: string;
  approvalYear: string;
  indication: string;
  dosage: string;
  labelUrl: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface SavedInquiry {
  id: string;
  date: string;
  articleTitle: string;
  articleId: string;
  summary: string;
  chatHistory: ChatMessage[];
}

export type FeedbackStatus = 'pending' | 'replied' | 'scheduled' | 'completed';

export interface Feedback {
  id: string;
  username: string;
  content: string;
  images: string[]; // Base64 strings
  status: FeedbackStatus;
  reply?: string;
  upvotes: number;
  timestamp: string;
  isBug: boolean;
}

export interface RehabExercise {
  name: string;
  count: number;
}

export interface RehabRecord {
  id: string;
  date: string; // ISO string
  duration: number; // minutes
  level: number; // 1, 2, 3
  exercises: RehabExercise[];
}

export interface RehabStatus {
  id: string;
  date: string; // ISO string
  hasJointPain: boolean;
  jointPainDetails: string;
  hasJointContracture: boolean;
  jointContractureDetails: string;
}

export interface UserDatabaseEntry {
  username: string;
  profile: UserProfile | null;
  savedInquiries: SavedInquiry[];
  rehabRecords: RehabRecord[];
  rehabStatusHistory: RehabStatus[];
}
