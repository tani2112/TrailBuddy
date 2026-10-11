# 🌿 TrailBuddy — Your AI Nature Companion

> **"The real world outside has no battery limit, zero latency, and infinite resolution."**

TrailBuddy is a modern, nature-inspired web application designed to encourage people to spend less time on screens and more time in nature. It helps users discover outdoor wonders, complete mindful "Touch Grass" challenges, consult a local open-weight AI guide, and record personal field observations in a private SQLite journal.

---

## 🧭 Tech Stack & Philosophy

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide icons, Canvas Confetti.
- **Backend**: Python 3.10+ with FastAPI, `aiosqlite` for async SQLite, `httpx` for Ollama communication.
- **AI Core**: Ollama running locally on your device with open-weight models (e.g. `llama3.2`, `mistral`, `phi3`). **No paid cloud AI APIs. 100% private and on-device.**
- **Database**: SQLite (`trailbuddy.db`) with zero external cloud dependencies.
- **Design Aesthetic**: Forest green, sage green, warm cream parchment, tactile rounded cards, organic typography, and distraction-free "Pocket Mode".

---

## 🚀 Quick Start Guide (Ubuntu Linux)

### 1. Prerequisites
Ensure you have Python 3.10+, Node.js (v20+), and npm installed:
```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip nodejs npm curl
```

---

### 2. Setting Up Local AI with Ollama
TrailBuddy uses Ollama for local open-weight language model inference.

#### Step A: Install Ollama
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

#### Step B: Start the Ollama Service
```bash
ollama serve
```
*(Or if installed as a system service: `sudo systemctl start ollama`)*

#### Step C: Download Your Preferred Model
Pull your desired open-weight model (default is `llama3.2`):
```bash
# Recommended lightweight model (3B parameters):
ollama run llama3.2

# Or even lighter for constrained laptops:
ollama run llama3.2:1b
# or:
ollama run phi3
```
> **Note:** If Ollama is not running, TrailBuddy will continue to function fully (Missions, Timers, and Journal work 100% offline). The AI Guide view will display connection diagnostics and setup instructions.

---

### 3. Backend Setup (FastAPI & SQLite)

From the project root:
```bash
cd backend

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env from template (defaults are preconfigured)
cp .env.example .env

# Run FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API is now running at `http://localhost:8000`.
- API Documentation (Swagger): `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

---

### 4. Frontend Setup (React, TypeScript & Vite)

Open a new terminal window:
```bash
cd frontend

# Install npm packages
npm install

# Create .env from template
cp .env.example .env

# Launch Vite dev server
npm run dev -- --host 0.0.0.0 --port 5173
```
Open your browser at `http://localhost:5173`.

---

## 🌟 Core Features

### 1. 🏕️ Home Dashboard
- **Welcome Hero**: *"Your next adventure starts outside."*
- **Today's Featured Mission**: Dynamically selected daily outdoor challenge with 1-click start.
- **Exploration Stats**: Real-time counter of Exploration XP, Completed Challenges, Journal Count, and Outdoor Minutes.
- **Action Grid**: Prominent buttons to *"Explore Nature"*, *"Start a Mission"*, and *"Open Journal"*.
- **Screen-Time Philosophy**: Mindful banners encouraging users to put their devices away.

### 2. 🌲 AI Nature Guide
- **Local Open-Weight Intelligence**: Integrates directly with Ollama without any third-party cloud API keys or subscriptions.
- **Field Curiosity First**: Tailored system prompt that guides users to observe leaf arrangement, bark texture, bird calls, and animal tracks.
- **Safety First Disclaimer**: Emphasizes never consuming wild plants or mushrooms without local certified expert guidance. Never claims to be a computer-vision taxonomic sensor.
- **Example Question Chips**: Clickable prompts (poison ivy identification, bird alarm calls, tracking cues, Leave No Trace principles).
- **Diagnostics**: Live connection badge and in-app setup guide for Ubuntu.

### 3. 🌿 18 "Touch Grass" Outdoor Missions
- Rich catalog across 5 outdoor categories:
  1. **Wildlife**: Avian Stillness, Mini Beast Expedition, Twilight Dawn Chorus.
  2. **Botany**: Leaf Architecture Detective, Bark Texture Safari, Nature's Fractals, Seed Dispersal Scout.
  3. **Sensory**: The 3-Minute Soundscape, Palette of the Forest, Scent of Damp Earth, Water Droplet Lens.
  4. **Mindfulness**: Sun & Shadow Dial, Silent Footsteps Meditation, The 10-Minute Screen-Free Sit Spot.
  5. **Earth**: Cloud Flow Observation, Fallen Log Micro-Habitat, Wind Velocity Dance, Stone & Mineral Chronicle.
- **Pocket / Look Around Mode**: During an active mission, tap "Enter Pocket Mode" to dim the screen into a calm, breathing organic display reminding you to put the phone in your pocket and observe the living world.
- **Chimes & Celebration**: Pleasant nature solfeggio audio chime on completion, confetti, and points awarding (+30 to +75 XP).
- **Reflection Capture**: Optional 1-click reflection note that automatically logs into your Nature Journal.

### 4. 📖 Private Nature Journal
- **Local Persistence**: Stored on-device in SQLite (`trailbuddy.db`).
- **Private & Safe**: Never asks for device GPS permissions; supports optional user-entered landmark names (e.g., "Cedar Creek Trail").
- **Observation Metadata**: Title, notes, weather/atmosphere selector, sensory impressions, category, and tags.
- **Search & Filtering**: Search observations by keyword, tag, or category.
- **Full CRUD**: Create, read, update, and delete entries seamlessly.

### 5. 📴 Offline-Friendly & PWA Support
- Manifest configured (`manifest.webmanifest`) and responsive mobile-first interface.
- App shell and mission definitions cached for offline use.
- Clear messaging separating offline core features (missions, timer, journal) from local AI inference requirements.

---

## 🛠️ Verification & Test Suite

An automated test script is provided in `backend/test_api.py`. To run the verification suite:
```bash
cd backend
./venv/bin/python test_api.py
```

### Verified Test Results:
1. `✓ Health Check Endpoint`: SQLite database healthy, connection status reporting.
2. `✓ AI Status Endpoint`: Successfully diagnoses Ollama connectivity and configured model (`llama3.2`).
3. `✓ AI Chat Graceful Degradation`: Returns descriptive 503 service instructions when Ollama is offline.
4. `✓ Missions Catalog`: 18 challenges loaded across 5 categories.
5. `✓ Category Filtering`: Category and difficulty query parameters verified.
6. `✓ Today's Mission`: Deterministic daily challenge selection verified.
7. `✓ Mission Progress`: Start, timer tracking, and completion endpoints verified.
8. `✓ Points & Stats Engine`: User XP awards, streak days, and completed counts accurately updated.
9. `✓ Journal CRUD`: Create, read, search, update, and delete operations tested and verified against SQLite.
10. `✓ Frontend Build`: TypeScript type-checks (`tsc -b`) and Vite production bundle (`vite build`) compiled with 0 errors.

---

## ⚙️ Configuration & Environment Variables

### Backend (`backend/.env`)
| Variable | Default | Description |
|---|---|---|
| `HOST` | `0.0.0.0` | Server bind address |
| `PORT` | `8000` | Server port |
| `DATABASE_PATH` | `trailbuddy.db` | Local SQLite database file path |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | Ollama daemon API URL |
| `OLLAMA_MODEL` | `llama3.2` | Open-weight model name |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Allowed CORS origins for frontend |

### Frontend (`frontend/.env`)
| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000/api` | Backend API URL |

---

## 📜 License
MIT License. Explore freely and respect natural habitats. Leave No Trace.
