import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pothole } from '../models/Pothole.model';
import { Event } from '../models/Event.model';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

export const chatWithGemini = async (req: Request, res: Response) => {
  try {
    const { message, history = [] }: ChatRequest = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Fetch real-time database statistics for context
    const [
      totalPotholes,
      newPotholes,
      plannedPotholes,
      inProgressPotholes,
      repairedPotholes,
      totalEvents,
      recentPotholes,
    ] = await Promise.all([
      Pothole.countDocuments(),
      Pothole.countDocuments({ status: 'new' }),
      Pothole.countDocuments({ status: 'planned' }),
      Pothole.countDocuments({ status: 'in-progress' }),
      Pothole.countDocuments({ status: 'repaired' }),
      Event.countDocuments(),
      Pothole.find()
        .sort({ firstReported: -1 })
        .limit(10)
        .select('severity status firstReported location reports'),
    ]);

    // Get top severity potholes
    const criticalPotholes = await Pothole.find({ severity: { $gte: 80 } })
      .sort({ severity: -1 })
      .limit(10)
      .select('severity status location reports firstReported');

    // Build context about the database
    const databaseContext = `
You are an AI assistant for RoadSense, a road pothole management system. You have access to the following REAL-TIME database information:

**CURRENT STATISTICS:**
- Total potholes in system: ${totalPotholes}
- New (unprocessed): ${newPotholes}
- Planned for repair: ${plannedPotholes}
- Currently being repaired: ${inProgressPotholes}
- Already repaired: ${repairedPotholes}
- Total events logged: ${totalEvents}

**TOP PRIORITY POTHOLES (Severity ≥ 80):**
${criticalPotholes.map((p: any, i: number) =>
  `${i + 1}. Severity: ${p.severity}, Status: ${p.status}, Reports: ${p.reports}, Age: ${Math.floor((Date.now() - new Date(p.firstReported).getTime()) / (1000 * 60 * 60 * 24))} days`
).join('\n')}

**RECENT POTHOLE REPORTS (Last 10):**
${recentPotholes.map((p: any, i: number) =>
  `${i + 1}. Severity: ${p.severity}, Status: ${p.status}, Reports: ${p.reports}, Reported: ${new Date(p.firstReported).toLocaleDateString()}`
).join('\n')}

**YOUR ROLE:**
You are a smart assistant that helps city officials and repair teams understand their road maintenance data. You can:
1. Analyze pothole priorities and suggest which should be repaired first
2. Provide insights on repair efficiency and progress
3. Answer questions about specific areas or severity levels
4. Suggest optimal repair strategies based on current data
5. Identify trends and patterns in pothole reports

**GUIDELINES:**
- Be concise and professional
- Use data to back up your recommendations
- Prioritize safety and efficiency
- When suggesting repairs, consider severity, number of reports, age, and location
- Format responses in a clear, scannable way using markdown

Now answer the user's question based on this real-time data.
`;

    // Build conversation history
    const conversationHistory = history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Initialize the model with context
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: databaseContext,
    });

    // Start chat with history
    const chat = model.startChat({
      history: conversationHistory as any,
    });

    // Send user message
    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    res.json({
      response: responseText,
      statistics: {
        totalPotholes,
        newPotholes,
        plannedPotholes,
        inProgressPotholes,
        repairedPotholes,
        totalEvents,
        criticalCount: criticalPotholes.length,
      },
    });
  } catch (error: any) {
    console.error('Error in Gemini chat:', error);
    res.status(500).json({
      error: 'Failed to process chat request',
      details: error.message,
    });
  }
};
