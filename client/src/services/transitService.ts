import { apiRequest } from "../lib/queryClient";

export interface Route {
  id: string;
  name: string;
  type: 'bus' | 'tram' | 'metro';
  accessibility: string;
}

export interface Vehicle {
  vehicleId: string;
  route: string;
  destination: string;
  eta: number;
  accessibility: string;
}

export interface JourneyOption {
  id: number;
  summary: string;
  duration: number;
  transfers: number;
  departureTime: string;
  arrivalTime: string;
  accessibility: string;
  steps: JourneyStep[];
}

export interface JourneyStep {
  mode: string;
  route: string;
  from: string;
  to: string;
  duration: number;
}

export interface PlanJourneyRequest {
  from: string;
  to: string;
  time?: string;
  date?: string;
  preferences: {
    wheelchair?: boolean;
    lowFloor?: boolean;
    fewerTransfers?: boolean;
  };
}

export const transitService = {
  async getRoutes(): Promise<Route[]> {
    const response = await apiRequest('GET', '/api/transit/routes');
    const data = await response.json();
    return data.routes;
  },

  async getRealTimeData(routeId: string): Promise<Vehicle[]> {
    const response = await apiRequest('GET', `/api/transit/realtime/${routeId}`);
    const data = await response.json();
    return data.vehicles;
  },

  async planJourney(request: PlanJourneyRequest): Promise<JourneyOption[]> {
    const response = await apiRequest('POST', '/api/transit/plan', request);
    const data = await response.json();
    return data.routes;
  },

  async requestBoardingAssistance(params: {
    routeId: string;
    stopId: string;
    assistanceNote?: string;
  }): Promise<{ success: boolean; message: string; requestId: string }> {
    const response = await apiRequest('POST', '/api/transit/assistance-request', params);
    return await response.json();
  }
};
