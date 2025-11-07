import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Safety keywords that trigger immediate refusal
const UNSAFE_KEYWORDS = [
  'diagnose', 'diagnosis', 'prescribe', 'prescription', 'dosage', 'dose',
  'emergency', 'urgent', 'hospital', 'doctor', 'treatment plan', 'medicine',
  'medication', 'drug', 'surgery', 'operation', 'cure', 'heal', 'therapy'
];

// Disease knowledge base - structured educational information
type DiseaseInfo = {
  definition: string;
  symptoms: string[];
  causes: string;
  complications: string[];
  prevention: string;
  transmission: string;
  public_health: string;
};

const DISEASE_KB: Record<string, DiseaseInfo> = {
  'diabetes': {
    definition: 'A chronic condition that affects how your body processes blood sugar (glucose).',
    symptoms: ['Increased thirst', 'Frequent urination', 'Extreme hunger', 'Unexplained weight loss', 'Fatigue', 'Blurred vision'],
    causes: 'Type 1 diabetes is caused by an autoimmune reaction. Type 2 diabetes develops when the body becomes resistant to insulin or when the pancreas cannot produce enough insulin.',
    complications: ['Heart disease', 'Nerve damage', 'Kidney damage', 'Eye damage', 'Foot damage', 'Skin conditions'],
    prevention: 'For Type 2 diabetes: maintain healthy weight, stay physically active, eat a healthy diet, and avoid sedentary behavior.',
    transmission: 'Diabetes is not contagious. It cannot be transmitted from person to person.',
    public_health: 'Over 537 million adults worldwide have diabetes. Early detection and lifestyle management are key to preventing complications.'
  },
  'hypertension': {
    definition: 'Also known as high blood pressure, a condition in which the force of blood against artery walls is consistently too high.',
    symptoms: ['Most people have no symptoms', 'Severe headaches', 'Nosebleeds', 'Shortness of breath', 'Chest pain'],
    causes: 'Can be caused by genetics, poor diet (high sodium), lack of physical activity, obesity, excessive alcohol, stress, and certain chronic conditions.',
    complications: ['Heart attack', 'Stroke', 'Heart failure', 'Kidney problems', 'Vision loss', 'Metabolic syndrome'],
    prevention: 'Maintain healthy weight, exercise regularly, eat a balanced diet low in sodium, limit alcohol, manage stress, and avoid tobacco.',
    transmission: 'Hypertension is not contagious.',
    public_health: 'Nearly half of adults have hypertension. Many are unaware they have it, which is why regular blood pressure checks are important.'
  },
  'asthma': {
    definition: 'A condition in which airways narrow and swell, producing extra mucus, making breathing difficult.',
    symptoms: ['Shortness of breath', 'Chest tightness', 'Wheezing when exhaling', 'Coughing attacks', 'Difficulty sleeping due to breathing problems'],
    causes: 'Exact cause is unknown, but involves a combination of genetic and environmental factors. Triggers include allergens, cold air, exercise, and respiratory infections.',
    complications: ['Permanent narrowing of airways', 'Frequent sick days', 'Sleep disruption', 'Emergency room visits'],
    prevention: 'Identify and avoid triggers, monitor breathing, follow action plans, get vaccinated for flu and pneumonia.',
    transmission: 'Asthma is not contagious.',
    public_health: 'Affects over 300 million people worldwide. Most asthma-related deaths occur in low and middle-income countries.'
  }
};

function checkSafety(query: string): { safe: boolean; reason?: string } {
  const lowerQuery = query.toLowerCase();
  
  // Check for unsafe keywords
  for (const keyword of UNSAFE_KEYWORDS) {
    if (lowerQuery.includes(keyword)) {
      return {
        safe: false,
        reason: `I cannot provide medical advice, diagnoses, prescriptions, or treatment recommendations. Please consult a qualified healthcare professional for medical concerns.`
      };
    }
  }
  
  // Check for emergency situations
  if (lowerQuery.includes('emergency') || lowerQuery.includes('urgent') || lowerQuery.includes('help')) {
    return {
      safe: false,
      reason: `If you are experiencing a medical emergency, please call emergency services immediately or visit the nearest emergency room.`
    };
  }
  
  return { safe: true };
}

function findDiseaseMatch(query: string): string | null {
  const lowerQuery = query.toLowerCase();
  
  for (const disease in DISEASE_KB) {
    if (lowerQuery.includes(disease)) {
      return disease;
    }
  }
  
  return null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing query:', query);

    // Safety check
    const safetyCheck = checkSafety(query);
    if (!safetyCheck.safe) {
      console.log('Safety violation detected');
      return new Response(
        JSON.stringify({ 
          response: safetyCheck.reason,
          safe: false,
          type: 'safety_message'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for disease match in KB
    const diseaseMatch = findDiseaseMatch(query);
    let kbInfo = '';
    
    if (diseaseMatch && DISEASE_KB[diseaseMatch]) {
      const info = DISEASE_KB[diseaseMatch];
      kbInfo = `\n\nKnowledge Base Information about ${diseaseMatch}:\n` +
               `Definition: ${info.definition}\n` +
               `Common Symptoms: ${info.symptoms.join(', ')}\n` +
               `Causes: ${info.causes}\n` +
               `Potential Complications: ${info.complications.join(', ')}\n` +
               `Prevention: ${info.prevention}\n` +
               `Transmission: ${info.transmission}\n` +
               `Public Health Notes: ${info.public_health}`;
    }

    // Call Lovable AI with strict medical constraints
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a medical education assistant. Your ONLY role is to provide factual, educational information about diseases and health conditions.

STRICT RULES - YOU MUST FOLLOW THESE:
1. NEVER provide medical advice, diagnoses, or treatment recommendations
2. NEVER suggest medications, dosages, or prescriptions
3. NEVER tell users what to do about their symptoms
4. ONLY provide factual, educational information about diseases
5. Always remind users to consult healthcare professionals
6. If asked about treatment, diagnosis, or medical advice, refuse politely and direct them to healthcare providers
7. Focus on: definitions, general symptoms, causes, prevention, and public health facts
8. Keep responses concise (2-3 paragraphs maximum)

If you receive knowledge base information, use it as the primary source of facts.${kbInfo}

Remember: You are an educational resource, NOT a medical professional.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add funds to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // The AI is already constrained by a strict system prompt
    // No need for additional output filtering - trust the prompt
    console.log('Successfully generated educational response');

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        safe: true,
        kb_match: diseaseMatch,
        type: 'educational'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in medical-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
