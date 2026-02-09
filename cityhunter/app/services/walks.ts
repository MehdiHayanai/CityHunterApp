import { fetchWithAuth } from "@/app/lib/api";

export interface WalkCreate {
  title: string;
  description: string;
  stops: string[]; // List of POI IDs
}

export interface Walk {
  id: string;
  title: string;
  description: string;
  stops: any[]; // Ideally defined strictly with POI type
  status: 'DRAFT' | 'PUBLISHED';
  validation_status: 'GREEN' | 'RED';
}

export interface ValidationChecker {
    status: 'GREEN' | 'RED';
    messages: string[];
}

export const WalkService = {
  async createWalk(data: WalkCreate): Promise<Walk> {
    return fetchWithAuth('/walks', {
        method: 'POST',
        body: JSON.stringify(data),
    });
  },

  async getWalk(id: string): Promise<Walk> {
    return fetchWithAuth(`/walks/${id}`);
  },

  async validateWalk(id: string): Promise<ValidationChecker> {
      return fetchWithAuth(`/walks/${id}/validate`, {
          method: 'POST'
      });
  },

  async publishWalk(id: string): Promise<Walk> {
      return fetchWithAuth(`/walks/${id}/publish`, {
          method: 'POST'
      });
  },
  
  async getPublishedWalks(): Promise<Walk[]> {
       return fetchWithAuth('/explorer/walks');
  },
  
  async deleteWalk(id: string): Promise<void> {
      return fetchWithAuth(`/walks/${id}`, {
          method: 'DELETE'
      });
  },
};
