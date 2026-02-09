import { Monument } from './dashboard';

// JSON-RPC Response Structure for MCP
export interface MCPGenericResponse {
    jsonrpc: "2.0";
    result: any;
    id: number | string;
}

// Parameters sent to the 'generate_plan' tool
export interface ItineraryRequestParams {
    city: string; // e.g., "Kyoto"
    duration: string; // e.g., "4 hours"
    vibes: string[]; // e.g., ["Nature", "Cyberpunk"]
    prompt?: string; // Optional user instructions
}

// The structure of a single item in the itinerary
export interface ItineraryDisplayItem extends Monument {
    aiReasoning: string; // Why Gemini picked this
    timeAllocation: string; // "10:00 - 11:00"
}

// The final itinerary object returned by the server
export interface ItineraryResponse {
    id: string; // Session/Itinerary ID
    title: string; // e.g. "Neon Nights in Tokyo"
    items: ItineraryDisplayItem[];
}
