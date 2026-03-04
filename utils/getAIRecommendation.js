import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function getAIRecommendation(userPrompt, products) {
    try {
        const groqPrompt = `
            Here is a list of available products: 
            ${JSON.stringify(products, null, 2)}
            Based on the following user request, filter and suggest the best matching products:
            "${userPrompt}"

            Important: Only return the matching products in valid JSON format. 
            The response should be a JSON array of product objects exactly as they appear in the input.
            Do not include any additional text, markdown formatting, or explanations.
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: groqPrompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
            max_tokens: 1024,
            response_format: { type: "json_object" },
        });

        const aiResponseText = chatCompletion.choices[0]?.message?.content || "";
        
        if (!aiResponseText) {
            throw new Error("AI response is empty");
        }

        // Clean and parse JSON
        const cleanedText = aiResponseText.replace(/```json|```/g, '').trim();
        let parsedProducts = JSON.parse(cleanedText);
        
        // Ensure it's an array
        if (!Array.isArray(parsedProducts)) {
            if (parsedProducts.products) {
                parsedProducts = parsedProducts.products;
            } else {
                parsedProducts = [parsedProducts];
            }
        }

        return { success: true, products: parsedProducts };
    } catch (error) {
        console.error("AI Recommendation Error:", error);
        return { success: false, products: [], error: error.message };
    }
}