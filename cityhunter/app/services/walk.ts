import { fetchWithAuth } from "../lib/api";
import { POIService } from '@/app/services/poi';

export interface Walk {
  id: string;
  title: string;
  description: string;
  stops: any[]; // POI objects
  status: 'DRAFT' | 'GREEN' | 'YELLOW' | 'RED' | 'PUBLISHED';
  distance_km?: number;
  estimated_duration_minutes?: number;
  validation_messages?: string[];
}

export const WalkService = {
    // We reuse POI service for fetching available stops, but here are Walk-specifics
    
    async createDraft(title: string, description: string) {
        return fetchWithAuth('/walks/', {
            method: 'POST',
            body: JSON.stringify({ title, description, stops: [] }),
        });
    },

    async getWalk(id: string) {
        return fetchWithAuth(`/walks/${id}`);
    },

    async updateWalk(id: string, data: { title?: string; description?: string; stops?: string[] }) {
        return fetchWithAuth(`/walks/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },
    
    async validate(id: string) {
        return fetchWithAuth(`/walks/${id}/validate`, {
            method: 'POST'
        });
    }
};
