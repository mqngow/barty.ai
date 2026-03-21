import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTextToSpeech, getListGeminiMessagesQueryKey } from '@workspace/api-client-react';
import { useAppStore } from '@/store/use-app-store';

export function useBartyChat(conversationId: number | null) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [optimisticUserMessage, setOptimisticUserMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { mutateAsync: generateSpeech } = useTextToSpeech();
  const audioEnabled = useAppStore(state => state.audioEnabled);
  const setCurrentSessionId = useAppStore(state => state.setCurrentSessionId);
  const setCurrentRemedy = useAppStore(state => state.setCurrentRemedy);
  const setIsUpdatingRemedy = useAppStore(state => state.setIsUpdatingRemedy);
  const isUpdatingRemedy = useAppStore(state => state.isUpdatingRemedy);
  const queryClient = useQueryClient();

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playBartyVoice = async (text: string) => {
    if (!audioEnabled) return;
    try {
      const response = await generateSpeech({ data: { text } });
      if (response.audioBase64) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(`data:${response.mimeType};base64,${response.audioBase64}`);
        audioRef.current = audio;
        await audio.play();
      }
    } catch (err) {
      console.error("Failed to play Barty's voice:", err);
    }
  };

  const updateRemedy = async (convId: number) => {
    setIsUpdatingRemedy(true);
    try {
      const sessionRes = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: convId }),
      });
      if (!sessionRes.ok) return;
      const session = await sessionRes.json();
      setCurrentSessionId(session.id);

      const drinkRes = await fetch(`/api/sessions/${session.id}/generate-drink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!drinkRes.ok) return;
      const remedy = await drinkRes.json();

      // Ingredients come back as an array from fresh generation
      const ingredients = Array.isArray(remedy.ingredients)
        ? remedy.ingredients
        : typeof remedy.ingredients === 'string'
          ? remedy.ingredients.split(',').map((i: string) => i.trim())
          : [];

      setCurrentRemedy({
        name: remedy.name,
        description: remedy.description,
        ingredients,
        instructions: remedy.instructions,
        emoji: remedy.emoji,
      });
    } catch (err) {
      console.error("Failed to update remedy:", err);
    } finally {
      setIsUpdatingRemedy(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!conversationId) return;
    
    setIsStreaming(true);
    setStreamedText('');
    setOptimisticUserMessage(text);
    setError(null);

    try {
      const response = await fetch(`/api/gemini/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message to Barty');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  fullResponse += data.content;
                  setStreamedText(fullResponse);
                }
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }

      await queryClient.invalidateQueries({
        queryKey: getListGeminiMessagesQueryKey(conversationId)
      });
      
      if (fullResponse) {
        // Play audio and update remedy concurrently (fire-and-forget remedy)
        playBartyVoice(fullResponse);
        updateRemedy(conversationId);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong at the bar');
    } finally {
      setIsStreaming(false);
      setOptimisticUserMessage('');
      setStreamedText('');
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  return {
    sendMessage,
    isStreaming,
    streamedText,
    optimisticUserMessage,
    error,
    stopAudio,
    isUpdatingRemedy,
  };
}
