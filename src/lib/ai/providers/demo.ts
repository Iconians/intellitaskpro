import { extractUserListItems } from "@/lib/ai/extract-list-items";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function looksLikeWebsiteOrContentBrief(full: string, item: string): boolean {
  const blob = `${full}\n${item}`.toLowerCase();
  return (
    /\b(page|pages|hero|cta|sitemap|website|web site|landing|section|sections)\b/.test(
      blob
    ) ||
    /\b(services|about us|contact|home)\b.*\b(page|section)\b/.test(blob)
  );
}

function looksLikeBugfixBrief(full: string, item: string): boolean {
  const blob = `${full}\n${item}`.toLowerCase();
  return /\b(fix|bug|bugs|broken|regression|defect|error|crash|patch)\b/.test(
    blob
  );
}

function demoDescriptionForListItem(
  body: string,
  index: number,
  fullDescription: string
): string {
  const website = looksLikeWebsiteOrContentBrief(fullDescription, body);
  const bug = looksLikeBugfixBrief(fullDescription, body);

  if (website && !bug) {
    return [
      "Grounded in this slice of the brief:",
      body,
      "",
      "Deliverables: Turn the bullets above into concrete page/section work—outline blocks, messaging, and CTAs; implement in the site (or hand off with a spec). Acceptance: reviewer can map each subsection to something shippable; primary CTA and forms behave; layout is acceptable on mobile.",
    ].join("\n");
  }

  if (bug) {
    return [
      "Issue called out in backlog:",
      body,
      "",
      "Approach: reproduce reliably, isolate root cause, implement the fix, add a regression test or written verification so it does not return.",
    ].join("\n");
  }

  const phaseFocus = [
    "Pre-development: confirm outcomes, constraints, and acceptance with stakeholders; note dependencies and open questions.",
    "Development: implement end-to-end for this item in the right layers (UI, API, data, content).",
    "DevOps: CI, environments, secrets, and a safe deploy path if this ships beyond local.",
    "Testing: cover happy path, edge cases, and accessibility or integrations touched by this slice.",
    "Hosting & launch: DNS/SSL, production smoke checks, monitoring or rollback notes if user-facing.",
  ];
  const focus = phaseFocus[index % phaseFocus.length];

  return [
    "Backlog item:",
    body,
    "",
    `Suggested lens: ${focus}`,
    "Acceptance: write checks that reference this item’s specifics—avoid copying the same generic paragraph across unrelated tasks.",
  ].join("\n");
}

export async function generateDemoTasks(description: string) {
  const listItems = extractUserListItems(description);
  if (listItems.length >= 2) {
    await delay(1500);
    return listItems.map((body, index) => ({
      title: body.length > 140 ? `${body.slice(0, 137).trim()}…` : body,
      description: demoDescriptionForListItem(body, index, description),
      priority: /urgent|crash|blocking|security|data loss/i.test(body)
        ? "HIGH"
        : "MEDIUM",
      estimatedHours:
        /refactor|several|multiple|complex|investigate|confirm/i.test(body)
          ? 8
          : 4,
    }));
  }

  const keywords = description.toLowerCase();
  const tasks: Array<{
    title: string;
    description: string;
    priority: string;
    estimatedHours: number;
  }> = [];

  if (keywords.includes("api") || keywords.includes("backend")) {
    tasks.push(
      {
        title: "Design API endpoints",
        description: "Plan and document API structure and request/response formats",
        priority: "HIGH",
        estimatedHours: 4,
      },
      {
        title: "Set up database schema",
        description: "Create database models and migrations",
        priority: "HIGH",
        estimatedHours: 6,
      },
      {
        title: "Implement authentication",
        description: "Add JWT or session-based authentication and authorization",
        priority: "HIGH",
        estimatedHours: 8,
      },
      {
        title: "Create CRUD operations",
        description: "Implement create, read, update, delete endpoints",
        priority: "MEDIUM",
        estimatedHours: 12,
      },
      {
        title: "Add validation and error handling",
        description: "Implement input validation and consistent error responses",
        priority: "MEDIUM",
        estimatedHours: 6,
      },
      {
        title: "Write API documentation",
        description: "Document endpoints with examples (OpenAPI/Swagger)",
        priority: "LOW",
        estimatedHours: 4,
      }
    );
  } else if (keywords.includes("mobile") || keywords.includes("app")) {
    tasks.push(
      {
        title: "Design app screens",
        description: "Create UI/UX designs for mobile app",
        priority: "HIGH",
        estimatedHours: 10,
      },
      {
        title: "Set up mobile project",
        description: "Initialize React Native or Flutter project structure",
        priority: "HIGH",
        estimatedHours: 4,
      },
      {
        title: "Implement navigation",
        description: "Set up app navigation and routing",
        priority: "HIGH",
        estimatedHours: 6,
      },
      {
        title: "Build core features",
        description: "Implement main app functionality",
        priority: "MEDIUM",
        estimatedHours: 20,
      },
      {
        title: "Add API integration",
        description: "Connect app to backend API",
        priority: "MEDIUM",
        estimatedHours: 8,
      },
      {
        title: "Testing and deployment",
        description: "Test on devices and prepare for app stores",
        priority: "MEDIUM",
        estimatedHours: 10,
      }
    );
  } else if (keywords.includes("feature") || keywords.includes("sprint")) {
    tasks.push(
      {
        title: "Write technical spec / acceptance criteria",
        description: "Document scope, edge cases, and definition of done",
        priority: "HIGH",
        estimatedHours: 4,
      },
      {
        title: "Implement core logic",
        description: "Build the main feature or user story",
        priority: "HIGH",
        estimatedHours: 12,
      },
      {
        title: "Add unit and integration tests",
        description: "Cover critical paths and edge cases",
        priority: "MEDIUM",
        estimatedHours: 6,
      },
      {
        title: "Code review and refactor",
        description: "Address review feedback and clean up code",
        priority: "MEDIUM",
        estimatedHours: 4,
      },
      {
        title: "Update documentation",
        description: "Update README, API docs, or user-facing docs",
        priority: "LOW",
        estimatedHours: 2,
      }
    );
  } else {
    tasks.push(
      {
        title: "Define requirements and acceptance criteria",
        description: "Clarify scope, user stories, and definition of done",
        priority: "HIGH",
        estimatedHours: 4,
      },
      {
        title: "Set up development environment",
        description: "Initialize repo, dependencies, and tooling",
        priority: "HIGH",
        estimatedHours: 4,
      },
      {
        title: "Implement core functionality",
        description: "Build the main feature or fix",
        priority: "HIGH",
        estimatedHours: 12,
      },
      {
        title: "Write tests",
        description: "Add unit and integration tests",
        priority: "MEDIUM",
        estimatedHours: 6,
      },
      {
        title: "Code review and QA",
        description: "Review, refactor, and verify behavior",
        priority: "MEDIUM",
        estimatedHours: 4,
      },
      {
        title: "Documentation and deployment",
        description: "Update docs and deploy or hand off",
        priority: "LOW",
        estimatedHours: 4,
      }
    );
  }

  await delay(1500);
  return tasks;
}
