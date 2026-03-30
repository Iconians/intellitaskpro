import { extractUserListItems } from "@/lib/ai/extract-list-items";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateDemoTasks(description: string) {
  const listItems = extractUserListItems(description);
  if (listItems.length >= 2) {
    await delay(1500);
    return listItems.map((body) => ({
      title: body.length > 140 ? `${body.slice(0, 137).trim()}…` : body,
      description: `From backlog input:\n\n${body}\n\nScope: clarify current vs expected behavior, narrow to root cause, implement fix or change, add a check (test or manual verification) so it sticks.`,
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
