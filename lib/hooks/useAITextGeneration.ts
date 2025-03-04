"use client";

import { useState } from 'react';

export function useAITextGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const generateText = async (prompt: string): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
     
      const response = await fetch('https://api.deepai.org/api/text-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': 'placeholder-key',
        },
        body: JSON.stringify({ text: prompt }),
      });
      
     
      if (!response.ok) {
        const quoteResponse = await fetch('https://api.quotable.io/random');
        const quoteData = await quoteResponse.json();
        setLoading(false);
        return `"${quoteData.content}" - ${quoteData.author}`;
      }
      
      const data = await response.json();
      setLoading(false);
      return data.output || 'Generated text not available';
    } catch (error) {
      console.error('Error generating text:', error);
      setError('Failed to generate text. Using fallback...');
      setLoading(false);
      
      
      return `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`;
    }
  };
  
  return {
    generateText,
    loading,
    error,
  };
}