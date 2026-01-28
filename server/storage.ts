import { type User, type InsertUser, type Permit, type InsertPermit } from "@shared/schema";
import { randomUUID } from "crypto";

// API Log entry for debugging
export interface ApiLog {
  id: string;
  timestamp: string;
  permitId: string;
  projectName: string;
  endpoint: string;
  method: string;
  requestPayload: any;
  responseStatus: number | null;
  responseBody: any;
  success: boolean;
  simulationMode: boolean;
}

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Permit methods
  getAllPermits(): Promise<Permit[]>;
  getPermit(id: string): Promise<Permit | undefined>;
  createPermit(permit: InsertPermit): Promise<Permit>;
  resetPermits(): Promise<void>;
  
  // API Log methods
  addApiLog(log: Omit<ApiLog, 'id' | 'timestamp'>): Promise<ApiLog>;
  getApiLogs(): Promise<ApiLog[]>;
  clearApiLogs(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private permits: Permit[];
  private apiLogs: ApiLog[];

  constructor() {
    this.users = new Map();
    this.permits = this.getInitialPermits();
    this.apiLogs = [];
  }

  private getInitialPermits(): Permit[] {
    return [
      {
        id: "PMT-2024-8921",
        project_name: "Potomac River Bridge Repair",
        location: "Arlington, VA",
        applicant: "Infrastructure Corp LLC",
        submitted_date: "2024-01-24",
        status: "Maestro Workflow",
        progress: 35,
        agency_routing: ["DOT", "EPA", "USACE"]
      },
      {
        id: "PMT-2024-8922",
        project_name: "Solar Farm Expansion - Zone B",
        location: "Mojave, CA",
        applicant: "GreenGrid Energy",
        submitted_date: "2024-01-25",
        status: "EPA Review",
        progress: 60,
        agency_routing: ["EPA", "BLM"]
      },
      {
        id: "PMT-2024-8923",
        project_name: "Coastal Barrier Reinforcement",
        location: "Miami, FL",
        applicant: "Resilient Shores Inc",
        submitted_date: "2024-01-26",
        status: "Approved",
        progress: 100,
        agency_routing: ["FEMA", "USACE", "NOAA"]
      },
      {
        id: "PMT-2024-8924",
        project_name: "Urban Wetland Restoration",
        location: "Seattle, WA",
        applicant: "City of Seattle",
        submitted_date: "2024-01-27",
        status: "In Intake",
        progress: 10,
        agency_routing: ["EPA", "FWS"]
      },
      {
        id: "PMT-2024-8925",
        project_name: "High-Speed Rail Connector",
        location: "Dallas, TX",
        applicant: "Texas Transport Authority",
        submitted_date: "2024-01-22",
        status: "Final Sign-off",
        progress: 90,
        agency_routing: ["DOT", "FRA"]
      }
    ];
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllPermits(): Promise<Permit[]> {
    return this.permits;
  }

  async getPermit(id: string): Promise<Permit | undefined> {
    return this.permits.find(p => p.id === id);
  }

  async createPermit(insertPermit: InsertPermit): Promise<Permit> {
    const id = "PMT-2025-" + Math.floor(Math.random() * 9000 + 1000);
    const submitted_date = new Date().toISOString().split('T')[0];
    
    const permit: Permit = {
      id,
      submitted_date,
      ...insertPermit,
    };
    
    // Add to beginning of array (most recent first)
    this.permits.unshift(permit);
    return permit;
  }

  async resetPermits(): Promise<void> {
    // Remove all San Antonio permits
    const demoTitle = "The San Antonio Connectivity Hub & Green Energy Grid";
    this.permits = this.permits.filter(p => p.project_name !== demoTitle);
  }

  async addApiLog(logData: Omit<ApiLog, 'id' | 'timestamp'>): Promise<ApiLog> {
    const log: ApiLog = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ...logData,
    };
    this.apiLogs.unshift(log); // Add to beginning (most recent first)
    return log;
  }

  async getApiLogs(): Promise<ApiLog[]> {
    return this.apiLogs;
  }

  async clearApiLogs(): Promise<void> {
    this.apiLogs = [];
  }
}

export const storage = new MemStorage();
