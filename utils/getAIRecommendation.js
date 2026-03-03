export async function getAIRecommendation(userPrompt, products) {
    const API_KEY = process.env.GEMINI_API_KEY;
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    try {
        const geminiPrompt = `
            Here is a list of available products: 
            ${JSON.stringify(products, null, 2)}
            Based on the following user request, filter and suggest the best matching products:
            "${userPrompt}"

            Important: Only return the matching products in valid JSON format. 
            The response should be a JSON array of product objects exactly as they appear in the input.
            Do not include any additional text, markdown formatting, or explanations.
        `;

        const response = await fetch(URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                contents: [{parts: [{text: geminiPrompt}]}],
            }),
        });

        const data = await response.json();
        
        // Check if API response is valid
        if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error("Invalid API response");
        }

        const aiResponseText = data.candidates[0].content.parts[0].text.trim();
        
        // Clean the response (remove markdown code blocks if present)
        const cleanedText = aiResponseText.replace(/```json|```/g, '').trim();

        if (!cleanedText) {
            throw new Error("AI response is empty");
        }

        let parsedProducts;
        try {
            parsedProducts = JSON.parse(cleanedText);
        } catch (error) {
            console.error("JSON Parse Error:", error);
            console.log("Cleaned Text:", cleanedText);
            throw new Error("Failed to parse AI response");
        }

        return {success: true, products: parsedProducts};
    } catch (error) {
        console.error("AI Recommendation Error:", error);
        return {success: false, products: [], error: error.message};
    }
}