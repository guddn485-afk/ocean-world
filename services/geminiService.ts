
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBountyDescription = async (title: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `제주도 해양 정화 활동 "${title}"에 대한 전문적이고 간결한 보상 활동 설명을 작성해주세요. 
      환경적 영향과 지역적 특성에 집중하세요. 
      30자 이내의 한국어로 작성하세요.`,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      },
    });
    return response.text || "활동 상세 정보가 없습니다.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "제주 연안 환경 정화 활동 - 고위험군 수거 작업";
  }
};