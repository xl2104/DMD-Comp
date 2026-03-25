
import { Feedback, FeedbackStatus } from '../types';

const GLOBAL_FEEDBACK_KEY = 'hanzhi_global_feedback';

const MOCK_FEEDBACK: Feedback[] = [
  {
    id: 'f1',
    username: 'DMDsetup#1',
    content: '希望康复视频能增加更多的背景音乐选择，现在这个有点单调。',
    images: [],
    status: 'completed',
    reply: '感谢建议！我们已经更新了音频库，增加了更多舒缓的背景音乐。',
    upvotes: 12,
    timestamp: '2024-05-20',
    isBug: false
  },
  {
    id: 'f2',
    username: 'DMDsetup#2',
    content: '在搜索临床试验时，地区筛选偶尔会失效，查不到亚洲的项目。',
    images: [],
    status: 'replied',
    reply: '收到！我们正在核查PubMed和ClinicalTrials的接口调用逻辑，确认是同步延迟导致的。',
    upvotes: 8,
    timestamp: '2024-05-22',
    isBug: true
  },
  {
    id: 'f3',
    username: 'DMDsetup#3',
    content: '能不能增加一个导出分析结果到PDF的功能？方便给主治医生看。',
    images: [],
    status: 'scheduled',
    reply: '非常棒的创意！PDF导出功能已加入Q3开发计划，预计下月上线。',
    upvotes: 25,
    timestamp: '2024-05-25',
    isBug: false
  }
];

export const getFeedbacks = (): Feedback[] => {
  const data = localStorage.getItem(GLOBAL_FEEDBACK_KEY);
  if (!data) {
    localStorage.setItem(GLOBAL_FEEDBACK_KEY, JSON.stringify(MOCK_FEEDBACK));
    return MOCK_FEEDBACK;
  }
  return JSON.parse(data);
};

export const submitFeedback = async (
  username: string, 
  content: string, 
  images: string[], 
  isBug: boolean
): Promise<Feedback> => {
  const feedbacks = getFeedbacks();
  const newFeedback: Feedback = {
    id: `fb-${Date.now()}`,
    username,
    content,
    images,
    status: 'pending',
    upvotes: 0,
    timestamp: new Date().toISOString().split('T')[0],
    isBug
  };
  
  feedbacks.unshift(newFeedback);
  localStorage.setItem(GLOBAL_FEEDBACK_KEY, JSON.stringify(feedbacks));
  return newFeedback;
};

export const upvoteFeedback = (id: string): void => {
  const feedbacks = getFeedbacks();
  const fb = feedbacks.find(f => f.id === id);
  if (fb) {
    fb.upvotes += 1;
    localStorage.setItem(GLOBAL_FEEDBACK_KEY, JSON.stringify(feedbacks));
  }
};
