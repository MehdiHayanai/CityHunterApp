import { fetchWithAuth } from "../lib/api";

export type POIType = 'monument' | 'event';

export interface Location {
  lat: number;
  lng: number;
}

export interface POIBase {
  id?: string;
  name: string;
  description: string;
  location: Location;
  images: string[];
  hidden_description?: string;
  resources?: any[];
}
export type POI = POIBase;

export interface MonumentCreate extends POIBase {
  architectural_style?: string; // Optional in UI now
  opening_rules: any[]; 
}

export interface EventCreate extends POIBase {
  start_time: string;
  end_time: string;
  ticket_link?: string;
}

export const POIService = {
  // --- Helper: Map Frontend POI to Backend payload ---
  mapPOIForBackend(data: any): any {
    // 1. Destructure to extract and transform specific fields
    // We explicitly extract fields that shouldn't be in 'rest' to avoid clutter
    const { 
      id, name, desc, description, 
      lat, lng, location, 
      type, img, images, 
      status, address,
      likes, visitors, xp, swagg, dist, rating, // Strip dashboard clutter
      start_time, end_time, ticket_link,
      ...rest 
    } = data;
    
    // 2. Map coordinates correctly (GeoJSON: [lng, lat])
    const finalLng = Number(lng ?? location?.lng ?? data.location?.lng);
    const finalLat = Number(lat ?? location?.lat ?? data.location?.lat);

    // 3. Map images correctly
    let mappedImages: any[] = [];
    if (img) {
      mappedImages.push({ url: img, alt_text: name || data.name || "POI Image" });
    } else if (images && Array.isArray(images)) {
      mappedImages = images.map((i: any) => 
        typeof i === 'string' ? { url: i, alt_text: name || data.name || "POI Image" } : i
      ).filter(i => i?.url);
    }

    // 4. Construct backend payload (Strictly matching schemas)
    const payload: any = {
      ...rest, // Include extra fields like architectural_style, opening_rules, etc.
      name: name || data.name || "",
      description: description || desc || data.description || data.desc || "",
      location: { 
        type: 'Point', 
        coordinates: [finalLng, finalLat] 
      },
      images: mappedImages,
      tags: data.tags || (type ? [type] : ['Landmark'])
    };

    // Add event fields if they have values to avoid 422 if they were empty strings
    if (start_time) payload.start_time = start_time;
    if (end_time) payload.end_time = end_time;
    if (ticket_link) payload.ticket_link = ticket_link;

    console.log("POIService: Mapped payload for backend:", payload);
    return payload;
  },

  // --- Helper: Map Frontend Walk to Backend payload ---
  mapWalkForBackend(data: any): any {
    // Extract values with priority
    const title = data.title || data.name || "";
    const description = data.description || data.desc || "";
    const stops = data.stops || data.stopIds || [];
    
    // Map duration correctly
    const durationMatch = String(data.estTime || data.estimated_duration_minutes || "").match(/\d+/);
    const estimated_duration_minutes = durationMatch ? parseInt(durationMatch[0]) : 90;

    const payload = {
      title,
      description,
      stops: stops.map((id: any) => typeof id === 'object' ? (id.id || id._id) : String(id)),
      difficulty: data.difficulty || "Medium", // Ensure correct capitalization
      estimated_duration_minutes
    };

    console.log("POIService: Mapped Walk payload for backend:", payload);
    return payload;
  },

  // --- Helper: Map Backend Payload to Frontend POI ---
  transformToFrontendPOI(p: any): POIBase {
      return {
          ...p,
          id: p._id || p.id,
          location: {
              lat: p.location?.coordinates?.[1] || p.location?.lat || 0,
              lng: p.location?.coordinates?.[0] || p.location?.lng || 0
          },
          // Ensure images are strings or objects as expected? POIBase says strings[]
          // Backend returns objects { url, alt_text }.
          images: p.images?.map((i: any) => typeof i === 'string' ? i : i.url).filter(Boolean) || []
      };
  },

  async createMonument(data: any) {
    const payload = this.mapPOIForBackend(data);
    return fetchWithAuth('/pois/monument', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async createEvent(data: any) {
    const payload = this.mapPOIForBackend(data);
    return fetchWithAuth('/pois/event', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getPois(type?: POIType, lat?: number, lng?: number, radius?: number) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (lat) params.append('lat', lat.toString());
    if (lng) params.append('lng', lng.toString());
    if (radius) params.append('radius', radius.toString());
    
    return fetchWithAuth(`/pois?${params.toString()}`);
  },

  async getPoi(id: string) {
    return fetchWithAuth(`/pois/${id}`);
  },

  async updatePOI(id: string, data: any) {
    const payload = this.mapPOIForBackend(data);
    return fetchWithAuth(`/pois/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deletePOI(id: string) {
    return fetchWithAuth(`/pois/${id}`, {
      method: 'DELETE',
    });
  },

  async getWalks() {
     return fetchWithAuth('/walks/');
  },

  async createWalk(data: any) {
    const payload = this.mapWalkForBackend(data);
    return fetchWithAuth('/walks/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateWalk(id: string, data: any) {
    const payload = this.mapWalkForBackend(data);
    return fetchWithAuth(`/walks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteWalk(id: string) {
    return fetchWithAuth(`/walks/${id}`, {
      method: 'DELETE',
    });
  },

  async createNewVersion(id: string) {
    return fetchWithAuth(`/walks/${id}/new_version`, {
      method: 'POST'
    });
  }
};
