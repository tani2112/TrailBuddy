from fastapi import APIRouter, HTTPException, status
from ..schemas import ChatRequest, ChatResponse, OllamaStatusResponse
from ..services.ollama_service import ollama_service

router = APIRouter(prefix="/ai", tags=["AI Nature Guide"])

@router.get("/status", response_model=OllamaStatusResponse)
async def get_ai_status():
    """Retrieve detailed connection status of Ollama and installed models."""
    info = await ollama_service.get_status()
    return OllamaStatusResponse(
        connected=info["connected"],
        base_url=info["base_url"],
        model_configured=info["model_configured"],
        model_installed=info["model_installed"],
        available_models=info["available_models"],
        status_message=info["status_message"]
    )

@router.post("/chat", response_model=ChatResponse)
async def chat_with_nature_guide(payload: ChatRequest):
    """
    Send messages to the local Ollama open-weight language model.
    Handles connection dropouts, missing models, and outdoor safety prompts gracefully.
    """
    if not payload.messages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one message is required to talk to the AI Nature Guide."
        )

    # Convert pydantic models to dicts
    message_dicts = [{"role": m.role, "content": m.content} for m in payload.messages]

    try:
        result = await ollama_service.chat(
            messages=message_dicts,
            model=payload.model
        )
        return ChatResponse(
            response=result["response"],
            model_used=result["model_used"],
            disclaimer=result["disclaimer"],
            follow_up_tips=result.get("follow_up_tips", [])
        )
    except ConnectionError as ce:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "Ollama Service Unavailable",
                "message": str(ce),
                "resolution": "Start the Ollama daemon by running 'ollama serve' in your Ubuntu terminal."
            }
        )
    except TimeoutError as te:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail={
                "error": "Ollama Request Timeout",
                "message": str(te),
                "resolution": "The model is taking too long to generate a response. Consider using a faster model like llama3.2:1b."
            }
        )
    except RuntimeError as re:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "Model Error",
                "message": str(re),
                "resolution": "Check available models with 'ollama list' and pull the model using 'ollama pull <model_name>'."
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal AI Processing Error",
                "message": str(e)
            }
        )
