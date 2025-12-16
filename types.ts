export enum Region {
  ASIA = '亚洲 (Asia)',
  NORTH_AMERICA = '北美 (North America)',
  EUROPE = '欧洲 (Europe)',
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
  ageGroup: 'child' | 'adult';
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

export interface UserDatabaseEntry {
  username: string;
  profile: UserProfile | null;
  savedInquiries: SavedInquiry[];
}