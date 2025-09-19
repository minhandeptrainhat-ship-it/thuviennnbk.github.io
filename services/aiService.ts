import { GoogleGenAI, Type } from "@google/genai";

// Ensure API_KEY is available in the environment
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseBooksFromText = async (text: string): Promise<{ title: string; author: string; coverImage: string }[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Phân tích văn bản sau, được sao chép từ một trang tính, thành một mảng JSON gồm các đối tượng sách. Mỗi đối tượng phải có các thuộc tính 'title' (string) và 'author' (string). Dựa vào tiêu đề, hãy tạo một URL 'coverImage' hợp lý từ picsum.photos. Văn bản: \n\n${text}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: 'Tên sách' },
                            author: { type: Type.STRING, description: 'Tên tác giả' },
                            coverImage: { type: Type.STRING, description: 'URL ảnh bìa từ picsum.photos' },
                        },
                        required: ["title", "author", "coverImage"],
                    },
                },
            },
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("AI parsing for books failed:", error);
        throw new Error("Không thể phân tích dữ liệu sách từ AI.");
    }
};

export const parseStudentsFromText = async (text: string): Promise<{ name: string }[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Phân tích văn bản sau thành một mảng JSON gồm các đối tượng học sinh. Mỗi đối tượng phải có thuộc tính 'name' (string). Văn bản: \n\n${text}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: 'Tên học sinh' },
                        },
                         required: ["name"],
                    },
                },
            },
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("AI parsing for students failed:", error);
        throw new Error("Không thể phân tích dữ liệu học sinh từ AI.");
    }
};
