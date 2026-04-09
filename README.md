# MedEye: AI Hospital Receptionist

MedEye is a state-of-the-art, full-stack AI system designed to streamline hospital reception workflows. It leverages advanced LLMs and graph-based logic to handle patient intake, triage, and data extraction automatically.

## 1. Smart Patient Intake
MedEye uses **Gemini 3 Flash** to engage patients in natural conversation, identifying their primary concerns and medical history without the need for rigid forms.

## 2. Structured Information Extraction
The system utilizes **Pydantic-powered structured output** to reliably extract core patient details such as name, age, symptoms, and condition severity directly from conversation logs.

## 3. Automated Ward Triage
Using a specialized **Classification Node**, MedEye automatically determines the most appropriate hospital ward (e.g., Emergency, General, Mental Health) for a patient based on their reported symptoms and emergency level.

## 4. Graph-Based Logic (LangGraph)
The backend is built on **LangGraph**, enabling a modular, multi-step agentic workflow that includes extraction, validation, ward classification, and automated webhook dispatching.

## 5. Modern Full-Stack Architecture
- **Frontend**: A premium React 19 interface built with Vite and Tailwind CSS 4, featuring a dynamic glass-morphism chat UI and responsive patient data cards.
- **Backend**: High-performance FastAPI server with granular rate-limiting and asynchronous LLM processing.

## 6. Real-Time Data Integration
MedEye is designed for extensibility. It includes dedicated **Webhook Nodes** to push validated patient records to external Hospital Information Systems (HIS) or Electronic Medical Records (EMR).

## 7. Performance & Security
The system implements **FastAPI rate limiting** via SlowAPI and secure environment variable management to ensure service availability and protect sensitive API configurations.

## 8. Simple Deployment
- **Backend Setup**: Initialize a virtual environment (`venv`), install dependencies, and configure your `GOOGLE_API_KEY` in the `.env` file.
- **Frontend Setup**: Run `npm install` and `npm run dev` in the frontend directory to launch the interactive receptionist portal.
