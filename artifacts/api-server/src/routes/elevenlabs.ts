import { Router, type IRouter } from "express";
import { TextToSpeechBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const DEFAULT_VOICE_ID = "pqHfZKP75CvOlQylNhV4";

const apiKey = process.env.ELEVENLABS_API_KEY;
logger.info(
  { keyPresent: !!apiKey, keyLength: apiKey?.length ?? 0 },
  "ElevenLabs route loaded"
);

router.post("/elevenlabs/tts", async (req, res) => {
  const body = TextToSpeechBody.parse(req.body);
  const voiceId = body.voiceId || DEFAULT_VOICE_ID;

  if (!apiKey) {
    res.status(503).json({ error: "ElevenLabs not configured. Please add your ELEVENLABS_API_KEY." });
    return;
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: body.text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.65,
          similarity_boost: 0.8,
          style: 0.3,
          use_speaker_boost: true,
          speed: 1.15,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    logger.error(
      { status: response.status, voiceId, keyLength: apiKey.length, body: err },
      "ElevenLabs API error"
    );
    res.status(response.status).json({ error: `ElevenLabs error: ${err}` });
    return;
  }

  const audioBuffer = await response.arrayBuffer();
  const audioBase64 = Buffer.from(audioBuffer).toString("base64");

  res.json({ audioBase64, mimeType: "audio/mpeg" });
});

export default router;
