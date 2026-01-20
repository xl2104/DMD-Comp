import { GoogleGenAI } from "@google/genai";
import { Article, UserProfile, ChatMessage, ClinicalTrial, FDADrug } from '../types';

const getClient = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const DISCLAIMER = "免责声明：这是由人工智能生成的解释。所有获批药物及临床试验均需在专业医生指导下进行。此分析仅供科普参考。";

export const analyzeArticle = async (article: Article, profile: UserProfile): Promise<string> => {
    const ai = getClient();
    const prompt = `
    你是一位专门服务于DMD家庭的医学AI助手。请用中文回答。
    
    当前患者档案：
    - 年龄: ${profile.age} 岁
    - 基因突变: ${profile.geneticProfile}
    - 行动能力: ${profile.ambulatoryStatus}
    
    内容背景: 这是一篇医学研究文章。
    标题: ${article.title}
    摘要: ${article.abstract}
    
    任务:
    请仅针对该文章内容，为家属提供以下部分的解读。请务必加粗小标题。
    **1. 研究概要（家属版）**
    **2. 研究概要（专业版）**
    **3. 对我的意义（个性化匹配）**
    **4. 家庭启示**
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || "无法生成摘要。";
    } catch (error) {
        return "服务暂时不可用。";
    }
};

export const analyzeTrial = async (trial: ClinicalTrial, profile: UserProfile): Promise<string> => {
    const ai = getClient();
    const prompt = `
    作为DMD临床试验顾问，请分析**本项特定试验** (NCT ID: ${trial.nctId}) 与患者的适配度。
    
    患者信息：
    - 年龄: ${profile.age} 岁
    - 基因: ${profile.geneticProfile}
    - 状态: ${profile.ambulatoryStatus}
    
    试验信息（上下文）：
    - 标题: ${trial.title}
    - 阶段: ${trial.phase.join(', ')}
    - 入排标准: ${trial.eligibility}
    - 摘要: ${trial.summary}
    
    任务:
    请严格基于上述试验信息回答，不要讨论其他试验。
    1. **匹配度评估**: 百分比及原因。重点核对患者年龄(${profile.age}岁)是否在试验要求的年龄范围内。
    2. **关键准入条件**: 针对该患者最关键的几点。
    3. **潜在风险与收益**: 基于该试验设计。
    4. **后续建议**: 家属下一步可以做什么。
    
    请加粗小标题，使用通俗易懂的中文。`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || "无法完成分析。";
    } catch (error) {
        return "分析服务异常。";
    }
};

export const analyzeDrug = async (drug: FDADrug, profile: UserProfile): Promise<string> => {
    const ai = getClient();
    const prompt = `
    作为DMD药物咨询助手，请分析**本种特定FDA获批药物: ${drug.brandName}** 与患者的适配情况。
    
    患者信息：
    - 年龄: ${profile.age} 岁
    - 基因突变: ${profile.geneticProfile}
    - 行动能力: ${profile.ambulatoryStatus}
    
    药物信息（上下文）：
    - 品牌名: ${drug.brandName} (${drug.brandNameCn || '无中文名'})
    - 通用名: ${drug.genericName}
    - 适应症: ${drug.indication}
    - 剂量: ${drug.dosage}
    
    任务:
    请严格仅针对 ${drug.brandName} 药物进行解读，严禁提及其他无关药物。
    **1. 药物简介**
    **2. 获批与适应症（年龄/状态限制）**
    **3. 针对您的病情分析（核心部分：基因突变是否匹配？年龄是否符合适应症？）**
    **4. 给家庭的启示**
    
    请加粗小标题。以简短免责声明结尾。`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || "无法完成药物分析。";
    } catch (error) {
        return "分析服务异常。";
    }
};

export const chatWithContext = async (
    history: ChatMessage[], 
    newMessage: string, 
    context: string,
    profile: UserProfile,
    type: 'article' | 'trial' | 'drug'
): Promise<string> => {
    const ai = getClient();
    const systemInstruction = `
    你是一位DMD医学解读员。用户正在就一个特定的 ${type} 提问。
    
    ${type === 'trial' ? '当前讨论的临床试验：' : type === 'drug' ? '当前讨论的药物：' : '当前讨论的研究文章：'}
    ${context}
    
    患者背景: 年龄 ${profile.age} 岁, 状态 ${profile.ambulatoryStatus}, 基因: ${profile.geneticProfile}。
    
    核心规则：
    1. 你的回答必须**完全基于上述提供的 ${type} 信息**。
    2. 如果用户问“这个”或“该项目”，指的就是上述上下文中的内容。
    3. 严禁随意扩散到其他无关的药物或试验。
    4. 保持通俗易懂，始终包含免责声明："${DISCLAIMER}"。
    `;

    try {
        const chat = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: { systemInstruction },
            history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] }))
        });
        const result = await chat.sendMessage({ message: newMessage });
        return result.text;
    } catch (error) {
        return "回复失败，请检查网络。";
    }
};

export const chatWithArticle = async (h: ChatMessage[], n: string, c: string, p: UserProfile) => chatWithContext(h, n, c, p, 'article');