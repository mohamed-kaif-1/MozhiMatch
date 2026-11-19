import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../../src/app/api/analyze/route";
import { checkStructuralRules } from "../../src/lib/core/rules";
import devFixtures from "../../src/fixtures/development.json";
import { QuestionItem, AnalyzeResponse, AnalyzeRequest } from "../../src/lib/contracts/types";

describe("Structural Rule Client-Server Parity", () => {
  it("verifies 100% structural and semantic parity between client local rules and server /api/analyze across all fixtures", async () => {
    for (const fixture of devFixtures) {
      const items: QuestionItem[] = [fixture as QuestionItem];
      const testRequestId = "12345678-1234-4234-8234-123456789abc";
      const testRevision = 3;

      // 1. Client-side local evaluation (as executed in Workbench.tsx)
      const clientItems = items.map((item) => ({
        id: item.id,
        status: "needs_review" as const,
        structuralFindings: checkStructuralRules(item),
        comparisons: [],
      }));

      const clientResponse: AnalyzeResponse = {
        requestId: testRequestId,
        revision: testRevision,
        mode: "rules_only",
        model: null,
        providerStatus: "not_requested",
        warnings: [],
        items: clientItems,
      };

      // 2. Server-side /api/analyze evaluation
      const requestPayload: AnalyzeRequest = {
        requestId: testRequestId,
        revision: testRevision,
        locale: "en",
        mode: "rules",
        sourceKind: "public",
        consent: true,
        items,
      };

      const req = new NextRequest("http://localhost:3000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify(requestPayload),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const serverResponse: AnalyzeResponse = await res.json();

      // 3. Complete field-by-field parity check
      expect(clientResponse.requestId).toBe(serverResponse.requestId);
      expect(clientResponse.revision).toBe(serverResponse.revision);
      expect(clientResponse.mode).toBe(serverResponse.mode);
      expect(clientResponse.model).toBe(serverResponse.model);
      expect(clientResponse.providerStatus).toBe(serverResponse.providerStatus);
      expect(clientResponse.warnings).toEqual(serverResponse.warnings);
      expect(clientResponse.items.length).toBe(serverResponse.items.length);

      // 4. Exact item-by-item structural findings parity
      for (let i = 0; i < clientResponse.items.length; i++) {
        const cItem = clientResponse.items[i];
        const sItem = serverResponse.items[i];

        expect(cItem.id).toBe(sItem.id);
        expect(cItem.status).toBe(sItem.status);
        expect(cItem.status).toBe("needs_review");
        expect(cItem.comparisons).toEqual(sItem.comparisons);
        expect(cItem.comparisons).toEqual([]);
        expect(cItem.structuralFindings).toEqual(sItem.structuralFindings);
      }

      // 5. Total deep equality comparison
      expect(clientResponse).toEqual(serverResponse);
    }
  });

  it("verifies multi-item batch parity for clean, broken, and discrepancy items together", async () => {
    const allItems = devFixtures as QuestionItem[];
    const testRequestId = "87654321-4321-4321-8321-cba987654321";
    const testRevision = 5;

    const clientItems = allItems.map((item) => ({
      id: item.id,
      status: "needs_review" as const,
      structuralFindings: checkStructuralRules(item),
      comparisons: [],
    }));

    const clientResponse: AnalyzeResponse = {
      requestId: testRequestId,
      revision: testRevision,
      mode: "rules_only",
      model: null,
      providerStatus: "not_requested",
      warnings: [],
      items: clientItems,
    };

    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        requestId: testRequestId,
        revision: testRevision,
        locale: "en",
        mode: "rules",
        sourceKind: "public",
        consent: true,
        items: allItems,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const serverResponse: AnalyzeResponse = await res.json();

    expect(clientResponse).toEqual(serverResponse);
  });
});

