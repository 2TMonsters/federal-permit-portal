import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPermitSchema } from "@shared/schema";

const DOCUSIGN_TRIGGER_URL = "https://apps-d.docusign.com/api/maestro/v1/accounts/2bb4891f-4723-432f-8efa-a53ddd864fc8/workflow_definitions/05313dfd-5f88-4501-a082-e3c4316d0a33/trigger?hash=ZmU0YWViYjE3YjVlMWM0YjUxYzYzYjU3ZTI2NmQxNmI3YmRjODU5Y2Q5YjA1NmUxZmIwNWJjOGI0NDZmYzgzMzQ2ZWQ4NDc5Y2NjMDRkY2ZkNTE0YTM5Mzc0ZWFmYjk5ZjNjNWVjOTkyNWMxNjhlMDljMzAyYWFmMmExYzIwNzU0YzgxODZmMTZiMjI4OTdiYWRkYjI3MTc0NDNjNjU5ZDgyYWU2MDNmY2ZkY2EyYWFjZTRkODNhZmE2ZjhhZjUyN2Q1NDc0MGE2ZTBmNTRjOWY2YjFlNzQzMzVkZDdmMjU2ZmMyNmE1ZjY4ODBjOTYzMjBhYjBkMzZmY2E3ZjA2Yg==";

interface MaestroPayload {
  instance_name: string;
  participants: {
    [key: string]: {
      email: string;
    };
  };
  payload: {
    originating_applicant: string;
    project_name: string;
    participating_agencies: string[];
  };
}

interface MaestroResult {
  success: boolean;
  instanceId?: string;
  error?: string;
  simulationMode?: boolean;
  payload?: MaestroPayload;
  responseStatus?: number;
  responseBody?: any;
}

async function triggerMaestroWorkflow(
  projectName: string, 
  applicant: string,
  agencies: string[],
  submitterEmail: string = "antoninoardizzone@gmail.com"
): Promise<MaestroResult> {
  const accessToken = process.env.DOCUSIGN_ACCESS_TOKEN;

  // Build the payload matching DocuSign Maestro variable schema
  const instanceName = `Permit_${Date.now()}`;
  const payload: MaestroPayload = {
    instance_name: instanceName,
    participants: {
      "Submitter Email": {
        email: submitterEmail,
      },
    },
    payload: {
      originating_applicant: applicant,
      project_name: projectName,
      participating_agencies: agencies,
    },
  };

  // Check if credentials are configured
  if (!accessToken) {
    console.log("DocuSign Maestro: Running in simulation mode (missing access token)");
    return { 
      success: true, 
      simulationMode: true, 
      instanceId: "SIM-" + Date.now(),
      payload,
      responseStatus: undefined,
      responseBody: { message: "Simulation mode - no access token configured" }
    };
  }

  try {
    console.log("DocuSign Maestro: Triggering workflow with payload:", JSON.stringify(payload, null, 2));
    
    const response = await fetch(DOCUSIGN_TRIGGER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let responseBody: any;
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = { raw: responseText };
    }

    if (!response.ok) {
      console.error("DocuSign trigger failed:", response.status, responseBody);
      return { 
        success: false, 
        simulationMode: true, 
        instanceId: "SIM-" + Date.now(),
        payload,
        responseStatus: response.status,
        responseBody,
        error: `API returned ${response.status}`
      };
    }

    console.log("DocuSign Maestro workflow triggered successfully:", responseBody);
    
    return { 
      success: true, 
      instanceId: responseBody.instanceId || responseBody.workflowInstanceId || instanceName,
      simulationMode: false,
      payload,
      responseStatus: response.status,
      responseBody
    };

  } catch (error) {
    console.error("DocuSign Maestro API error:", error);
    return { 
      success: false, 
      simulationMode: true, 
      instanceId: "SIM-" + Date.now(),
      payload,
      responseStatus: undefined,
      responseBody: { error: String(error) },
      error: String(error)
    };
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get all permits
  app.get("/api/permits", async (_req, res) => {
    try {
      const permits = await storage.getAllPermits();
      res.json(permits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch permits" });
    }
  });

  // Get a single permit by ID
  app.get("/api/permits/:id", async (req, res) => {
    try {
      const permit = await storage.getPermit(req.params.id);
      if (!permit) {
        return res.status(404).json({ error: "Permit not found" });
      }
      res.json(permit);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch permit" });
    }
  });

  // Create a new permit and trigger Maestro workflow
  app.post("/api/permits", async (req, res) => {
    try {
      const validatedData = insertPermitSchema.parse(req.body);
      
      // Create the permit in our storage first to get the ID
      const permit = await storage.createPermit(validatedData);
      
      // Trigger the DocuSign Maestro workflow
      const maestroResult = await triggerMaestroWorkflow(
        validatedData.project_name,
        validatedData.applicant,
        validatedData.agency_routing || []
      );

      // Log the API call for troubleshooting
      await storage.addApiLog({
        permitId: permit.id,
        projectName: validatedData.project_name,
        endpoint: "DocuSign Maestro Trigger",
        method: "POST",
        requestPayload: maestroResult.payload,
        responseStatus: maestroResult.responseStatus || null,
        responseBody: maestroResult.responseBody,
        success: maestroResult.success && !maestroResult.simulationMode,
        simulationMode: maestroResult.simulationMode || false,
      });
      
      res.status(201).json({
        ...permit,
        maestro: {
          triggered: maestroResult.success,
          instanceId: maestroResult.instanceId,
          simulationMode: maestroResult.simulationMode || false,
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create permit" });
      }
    }
  });

  // Reset permits (remove San Antonio demo permit)
  app.post("/api/permits/reset", async (_req, res) => {
    try {
      await storage.resetPermits();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reset permits" });
    }
  });

  // Get configuration status (doesn't expose actual values)
  app.get("/api/config/status", async (_req, res) => {
    const accountId = !!process.env.DOCUSIGN_ACCOUNT_ID;
    const workflowId = !!process.env.DOCUSIGN_WORKFLOW_ID;
    const accessToken = !!process.env.DOCUSIGN_ACCESS_TOKEN;
    
    res.json({
      accountId,
      workflowId,
      accessToken,
      allConfigured: accountId && workflowId && accessToken,
    });
  });

  // Update DocuSign configuration (runtime only - not persisted to secrets)
  app.post("/api/config/docusign", async (req, res) => {
    try {
      const { accountId, workflowId, accessToken } = req.body;
      
      // Update environment variables at runtime
      if (accountId) process.env.DOCUSIGN_ACCOUNT_ID = accountId;
      if (workflowId) process.env.DOCUSIGN_WORKFLOW_ID = workflowId;
      if (accessToken) process.env.DOCUSIGN_ACCESS_TOKEN = accessToken;
      
      const updatedFields = [];
      if (accountId) updatedFields.push("Account ID");
      if (workflowId) updatedFields.push("Workflow ID");
      if (accessToken) updatedFields.push("Access Token");
      
      res.json({ 
        success: true, 
        message: `Updated: ${updatedFields.join(", ")}`,
        note: "These changes are temporary and will reset when the server restarts."
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update configuration" });
    }
  });

  // Get API logs for archive/debugging
  app.get("/api/logs", async (_req, res) => {
    try {
      const logs = await storage.getApiLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  // Clear API logs
  app.delete("/api/logs", async (_req, res) => {
    try {
      await storage.clearApiLogs();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear logs" });
    }
  });

  return httpServer;
}
