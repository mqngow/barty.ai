import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getListGeminiMessagesQueryKey } from '@workspace/api-client-react';
import { useAppStore } from '@/store/use-app-store';

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .trim();
}

let cachedKey: { apiKey: string; voiceId: string } | null = null;

async function fetchElevenLabsKey(): Promise<{ apiKey: string; voiceId: string } | null> {
  if (cachedKey) return cachedKey;
  try {
    const res = await fetch('/api/elevenlabs/key');
    if (!res.ok) return null;
    cachedKey = await res.json();
    return cachedKey;
  } catch {
    return null;
  }
}

async function callElevenLabsDirect(text: string, apiKey: string, voiceId: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.65,
          similarity_boost: 0.8,
          style: 0.3,
          use_speaker_boost: true,
          speed: 1.15,
        },
      }),
    });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export function useBartyChat(conversationId: number | null) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [optimisticUserMessage, setOptimisticUserMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
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
      window.speechSynthesis?.cancel();
    };
  }, []);

  const playWithWebSpeech = (text: string) => {
    const synth = window.speechSynthesis;
    if (!synth) { setIsSpeaking(false); return; }
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(stripMarkdown(text));
    utterance.rate = 0.82;
    utterance.pitch = 0.65;
    utterance.volume = 1;

    const trySpeak = () => {
      const voices = synth.getVoices();
      const preferred = voices.find(v =>
        /david|daniel|thomas|mark|fred|ralph|bruce|junior/i.test(v.name)
      ) || voices.find(v => v.lang.startsWith('en') && !v.name.toLowerCase().includes('female'));
      if (preferred) utterance.voice = preferred;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      synth.speak(utterance);
    };

    if (synth.getVoices().length > 0) trySpeak();
    else synth.addEventListener('voiceschanged', trySpeak, { once: true });
  };

  const playBartyVoice = async (text: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const keyData = await fetchElevenLabsKey();
    if (keyData) {
      const buffer = await callElevenLabsDirect(text, keyData.apiKey, keyData.voiceId);
      if (buffer) {
        try {
          const blob = new Blob([buffer], { type: 'audio/mpeg' });
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.addEventListener('playing', () => setIsSpeaking(true));
          audio.addEventListener('ended', () => { setIsSpeaking(false); URL.revokeObjectURL(url); });
          audio.addEventListener('pause', () => setIsSpeaking(false));
          audio.addEventListener('error', () => { setIsSpeaking(false); playWithWebSpeech(text); });
          await audio.play();
          return;
        } catch {
          // fall through to Web Speech
        }
      }
    }

    playWithWebSpeech(text);
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
      console.error('Failed to update remedy:', err);
    } finally {
      setIsUpdatingRemedy(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!conversationId) return;

    setIsStreaming(true);
    setIsSpeaking(true);
    setStreamedText('');
    setOptimisticUserMessage(text);
    setError(null);

    try {
      const response = await fetch(`/api/gemini/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });

      if (!response.ok) throw new Error('Failed to send message to Barty');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  fullResponse += data.content;
                  setStreamedText(fullResponse);
                }
              } catch {
                // incomplete chunk, ignore
              }
            }
          }
        }
      }

      await queryClient.invalidateQueries({
        queryKey: getListGeminiMessagesQueryKey(conversationId),
      });

      if (fullResponse) {
        updateRemedy(conversationId);
        if (audioEnabled) {
          playBartyVoice(fullResponse);
        } else {
          setIsSpeaking(false);
        }
      } else {
        setIsSpeaking(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong at the bar');
      setIsSpeaking(false);
    } finally {
      setIsStreaming(false);
      setOptimisticUserMessage('');
      setStreamedText('');
    }
  };

  const stopAudio = () => {
    if (audioRef.current) audioRef.current.pause();
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  return {
    sendMessage,
    isStreaming,
    streamedText,
    optimisticUserMessage,
    error,
    stopAudio,
    isUpdatingRemedy,
    isSpeaking,
  };
}
