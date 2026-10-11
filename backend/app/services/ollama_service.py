import logging
import httpx
from typing import Dict, Any, List, Optional
from ..config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are TrailBuddy's AI Nature Guide — a warm, encouraging, and knowledgeable outdoor companion.
Your mission is to inspire humans to step outside, observe the natural world closely, and spend less time staring at screens.

Follow these core principles in every response:
1. FIELD OBSERVATION FIRST: Help users identify and understand plants, birds, insects, trees, weather, and geology by asking what they observe: leaf arrangement (alternate vs opposite), margins (smooth, serrated), bark texture, bird calls, flight patterns, and scents.
2. SAFETY & FORAGING DISCLAIMER: Never certify that a wild mushroom, berry, or plant is safe to eat. Always advise: "Never ingest wild plants or fungi without certified local expert guidance."
3. CANDID TRANSPARENCY: You are an open-weight conversational assistant helping with field cues, NOT an automated computer-vision taxonomic diagnostic tool. Emphasize mindful observation techniques.
4. LEAVE NO TRACE: Remind users to protect habitats, leave rocks/plants where they lie, pack out all trash, and observe wildlife from a respectful distance.
5. CONCISE & OUTDOOR-FRIENDLY: Keep answers engaging, vivid, and concise (2-4 paragraphs max). At the end of every answer, offer 1 or 2 quick field observation cues and gently remind the user to put their device away and enjoy the real world around them.
"""

class OllamaService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.default_model = settings.OLLAMA_MODEL
        self.timeout = settings.OLLAMA_TIMEOUT_SECONDS

    async def get_status(self) -> Dict[str, Any]:
        """Check Ollama service health and installed models."""
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    models = [m.get("name") for m in data.get("models", [])]
                    model_installed = any(
                        self.default_model in m or m.startswith(self.default_model.split(":")[0])
                        for m in models
                    )
                    return {
                        "connected": True,
                        "base_url": self.base_url,
                        "model_configured": self.default_model,
                        "model_installed": model_installed,
                        "available_models": models,
                        "status_message": (
                            f"Ollama is running with {len(models)} model(s) available."
                            if model_installed
                            else f"Ollama is connected, but configured model '{self.default_model}' is not pulled yet."
                        )
                    }
                else:
                    return {
                        "connected": False,
                        "base_url": self.base_url,
                        "model_configured": self.default_model,
                        "model_installed": False,
                        "available_models": [],
                        "status_message": f"Ollama returned HTTP status {res.status_code}."
                    }
        except httpx.ConnectError:
            return {
                "connected": False,
                "base_url": self.base_url,
                "model_configured": self.default_model,
                "model_installed": False,
                "available_models": [],
                "status_message": f"Could not connect to Ollama at {self.base_url}. Ensure 'ollama serve' is running."
            }
        except Exception as e:
            return {
                "connected": False,
                "base_url": self.base_url,
                "model_configured": self.default_model,
                "model_installed": False,
                "available_models": [],
                "status_message": f"Ollama check error: {str(e)}"
            }

    async def chat(self, messages: List[Dict[str, str]], model: Optional[str] = None) -> Dict[str, Any]:
        """Send chat messages to Ollama."""
        target_model = model or self.default_model

        # Build message history with nature system prompt
        formatted_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in messages:
            if msg.get("role") in ["user", "assistant"]:
                formatted_messages.append({
                    "role": msg.get("role"),
                    "content": msg.get("content", "")
                })

        payload = {
            "model": target_model,
            "messages": formatted_messages,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
            }
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(f"{self.base_url}/api/chat", json=payload)
                
                if res.status_code == 200:
                    data = res.json()
                    content = data.get("message", {}).get("content", "").strip()
                    return {
                        "response": content,
                        "model_used": target_model,
                        "disclaimer": "AI Nature Guide responses are generated locally with an open-weight model for field inquiry. Always verify with local botanical/wildlife authorities before touching or consuming any wild species.",
                        "follow_up_tips": [
                            "Examine leaf arrangement and margins closely",
                            "Listen for song cadence and territory calls",
                            "Remember to put your phone down and look around!"
                        ]
                    }
                elif res.status_code == 404:
                    raise RuntimeError(
                        f"Model '{target_model}' was not found in your Ollama installation. "
                        f"Run 'ollama pull {target_model}' or 'ollama run {target_model}' in your terminal."
                    )
                else:
                    raise RuntimeError(
                        f"Ollama returned HTTP error {res.status_code}: {res.text}"
                    )
        except httpx.ConnectError:
            raise ConnectionError(
                f"Cannot connect to Ollama at {self.base_url}. "
                f"Start Ollama locally on Ubuntu with: 'ollama serve' or 'systemctl start ollama'."
            )
        except httpx.ReadTimeout:
            raise TimeoutError(
                f"Ollama took longer than {self.timeout}s to respond. "
                "Try asking a shorter question or running a smaller model such as 'llama3.2:1b' or 'phi3'."
            )

ollama_service = OllamaService()
