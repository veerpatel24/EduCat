import OpenAI from 'openai';

const apiKey = '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';

const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Required since we are running in Electron/React client-side
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const generateAIResponse = async (messages: ChatMessage[]) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: messages,
      model: 'gpt-5-nano', // Updated to gpt-5-nano as requested
    });

    return completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I apologize, but I encountered an error connecting to the AI service. Please check your internet connection or API key.";
  }
};
