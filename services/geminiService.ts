import { GoogleGenAI } from "@google/genai";
import { Article, UserProfile, ChatMessage } from '../types';

const getClient = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const DISCLAIMER = "免责声明：这是由人工智能根据文章摘要生成的解释。研究处于早期阶段，可能不适用于每一位患者。它不能替代医生的建议。请务必咨询专业医疗人员。";

export const analyzeArticle = async (article: Article, profile: UserProfile): Promise<string> => {
    const ai = getClient();
    
    // Translation map for enums to ensure the prompt understands the context even if mixed
    const prompt = `
    你是一位富有同情心且专业的医学AI助手，专门服务于杜氏肌营养不良症（DMD）家庭。请用中文（简体）回答。
    
    当前患者档案：
    - 年龄组: ${profile.ageGroup === 'child' ? '儿童' : '成人'}
    - 基因突变: ${profile.geneticProfile}
    - 行动能力: ${profile.ambulatoryStatus}
    - 激素使用: ${profile.onSteroids}
    - 地区: ${profile.region}
    - 关注领域: ${profile.interests.join(', ')}
    
    文章标题: ${article.title}
    摘要: ${article.abstract}
    
    任务:
    请严格按照以下四个部分的标题和要求进行解读，**每个小标题请务必加粗** (例如: **标题**) ，并且每个部分之间请务必空一行以便阅读：

    **1. 研究概要（家属版）**
    (要求：用适合15岁学生理解的通俗中文总结这篇文章的核心内容。)

    **2. 研究概要（专业版）**
    (要求：为专业人士提供的精炼医学摘要。)

    **3. 根据患者个性化病情，这个研究对我有何种意义**
    (要求：结合上述患者档案进行个性化解读。例如，如果文章关于第51外显子跳跃，而患者有不同的突变，请解释为何可能不适用。如果是基础科学论文，请解释其潜在的未来影响。)

    **4. 给家庭启示**
    (要求：保持充满希望但务实的语气，总结这篇文章给家庭带来的启示或建议。)
    
    请以简短清晰的免责声明结尾。
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "抱歉，暂时无法生成摘要。";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "服务暂时不可用，请稍后再试。";
    }
};

export const chatWithArticle = async (
    history: ChatMessage[], 
    newMessage: string, 
    article: Article, 
    profile: UserProfile
): Promise<string> => {
    const ai = getClient();

    const systemInstruction = `
    你是DMD研究的AI解读员。你正在与一位家庭成员交谈。
    请始终保持友善，使用通俗易懂的中文（15岁理解水平），并基于提供的具体文章进行回答。
    
    文章背景:
    标题: ${article.title}
    摘要: ${article.abstract}
    
    患者背景:
    状态: ${profile.ambulatoryStatus}, ${profile.ageGroup}, 激素使用: ${profile.onSteroids}。
    
    规则:
    - 严格基于文章内容和DMD的一般医学知识回答用户问题。
    - 如果文章没有回答该问题，请直说。
    - 如果给出任何类似建议的内容，必须包含免责声明: "${DISCLAIMER}"
    `;

    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
            },
            history: history.map(h => ({
                role: h.role,
                parts: [{ text: h.text }]
            }))
        });

        const result = await chat.sendMessage({ message: newMessage });
        return result.text;
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return "网络连接出现问题，请重试。";
    }
};