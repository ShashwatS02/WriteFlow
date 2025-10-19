import { Pool } from "pg";
import * as dotenv from "dotenv";
import { existsSync } from "fs";

// Load env from .env.local first, then fallback to .env
if (existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
} else {
  dotenv.config();
}

const connectionString =
  process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
if (!connectionString) {
  console.error(
    "No DATABASE_URL or NEON_DATABASE_URL provided. Set environment variable and retry."
  );
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // categories
    const categories = [
      {
        slug: "tech",
        name: "Tech",
        description: "Software, tools, and engineering.",
        colorVariant: "blue",
      },
      {
        slug: "design",
        name: "Design",
        description: "Product and visual design.",
        colorVariant: "purple",
      },
      {
        slug: "lifestyle",
        name: "Lifestyle",
        description: "Work, life, and balance.",
        colorVariant: "green",
      },
      {
        slug: "productivity",
        name: "Productivity",
        description: "Tips for getting things done.",
        colorVariant: "orange",
      },
      {
        slug: "tutorials",
        name: "Tutorials",
        description: "Step by step guides and how-tos.",
        colorVariant: "teal",
      },
      {
        slug: "reviews",
        name: "Reviews",
        description: "In-depth product and book reviews.",
        colorVariant: "pink",
      },
    ];

    const categoryIds: Record<string, number> = {};
    for (const cat of categories) {
      const res = await client.query(
        `INSERT INTO categories (slug, name, description, color_variant) VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, color_variant = EXCLUDED.color_variant RETURNING id`,
        [cat.slug, cat.name, cat.description, cat.colorVariant]
      );
      categoryIds[cat.slug] = res.rows[0].id;
    }

    // helper
    const now = new Date();
    function wordsToReadingTime(words: number) {
      return Math.max(1, Math.ceil(words / 200));
    }

    const demoPosts = [
      {
        slug: "introducing-writeflow",
        title: "Introducing WriteFlow: The Future of Content Management",
        excerpt:
          "An opinionated single-admin blogging platform built for creators who value simplicity, performance, and beautiful design. Discover what makes WriteFlow different.",
        content: `# Welcome to WriteFlow

WriteFlow represents a new approach to content management—one that prioritizes **developer experience** without sacrificing user experience. Built with modern technologies and designed for the future, it's the platform we wish existed when we started our own content journey.

## Why We Built WriteFlow

The content management landscape is cluttered with solutions that are either:

- Too complex for simple use cases
- Too limited for serious content creators
- Too slow for modern web standards
- Too inflexible for custom workflows

WriteFlow strikes the perfect balance. It's **powerful enough** for serious bloggers yet **simple enough** for anyone to use.

## Core Philosophy

Our design philosophy centers around three key principles:

### 1. Simplicity First
Every feature is designed with ease-of-use in mind. Complex workflows are abstracted away, leaving you with clean, intuitive interfaces.

### 2. Performance by Default
Built on Next.js 15 with modern caching strategies, WriteFlow delivers lightning-fast loading times and smooth interactions.

### 3. Type Safety Throughout
Leveraging TypeScript and tRPC, we ensure that your content is always consistent and your development experience is error-free.

## Technical Architecture

\`\`\`mermaid
graph TD
    A[Next.js 15] --> B[tRPC v11]
    B --> C[Drizzle ORM]
    C --> D[Neon Postgres]
    A --> E[React Query]
    A --> F[Tailwind CSS]
    F --> G[Dark Mode]
\`\`\`

## Getting Started

Setting up WriteFlow is straightforward:

1. Clone the repository
2. Configure your environment variables
3. Run the database migrations
4. Start creating amazing content

The entire setup process takes less than 5 minutes.

## What's Next?

This is just the beginning. We're constantly improving WriteFlow based on community feedback and our own content creation needs. Join us on this journey to make content management delightful again.

*Ready to transform your content workflow? Let's dive in.*`,
        categories: ["tech", "productivity"],
        wordCount: 450,
        publishedOffsetDays: 30,
      },
      {
        slug: "design-systems-best-practices",
        title: "Design Systems: Building Scalable UI Foundations",
        excerpt:
          "How to create and maintain design systems that scale with your team and product. Learn from real-world examples and proven methodologies.",
        content: `# Building Scalable Design Systems

Design systems have evolved from nice-to-have documentation to essential infrastructure. They're the foundation that enables teams to build consistent, high-quality user interfaces at scale.

## What Makes a Great Design System?

A design system isn't just a collection of components—it's a **living ecosystem** that encompasses:

- **Design tokens** for consistent styling
- **Component libraries** for reusable UI elements
- **Documentation** that guides implementation
- **Governance** that ensures long-term success

### Design Tokens: The Foundation

Design tokens are the atomic elements of your design system. They define:

\`\`\`css
:root {
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;
  
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;
  
  --border-radius-sm: 0.375rem;
  --border-radius-md: 0.5rem;
}
\`\`\`

## Component Architecture

Well-designed components follow these principles:

### 1. Single Responsibility
Each component should have one clear purpose and do it exceptionally well.

### 2. Composability
Components should work together seamlessly, following consistent patterns.

### 3. Accessibility First
Every component must be usable by everyone, regardless of ability.

## Implementation Strategy

### Phase 1: Audit and Inventory
- Catalog existing UI patterns
- Identify inconsistencies
- Document current state

### Phase 2: Define Standards
- Establish design principles
- Create token system
- Build foundation components

### Phase 3: Rollout and Adoption
- Migrate existing interfaces
- Train team members
- Establish governance processes

## Common Pitfalls to Avoid

> **Warning**: Don't try to build everything at once. Start small and grow organically.

1. **Over-engineering**: Building components for hypothetical future needs
2. **Under-documenting**: Assuming team members will figure it out
3. **Neglecting maintenance**: Treating the system as "done" rather than evolving

## Tools and Resources

Popular tools for design system development:

- **Figma** for design collaboration
- **Storybook** for component documentation
- **Style Dictionary** for token management
- **Chromatic** for visual testing

## Measuring Success

Track these metrics to gauge your design system's impact:

- **Development velocity**: Time to implement new features
- **Design consistency**: Visual coherence across products
- **Developer satisfaction**: Team feedback and adoption rates
- **Maintenance overhead**: Time spent on UI bug fixes

## The Future of Design Systems

As we look ahead, design systems will become more:

- **Automated**: AI-assisted component generation
- **Integrated**: Seamless design-to-code workflows
- **Adaptive**: Context-aware component behavior

*A well-crafted design system is an investment that pays dividends in development speed, user experience, and team collaboration.*`,
        categories: ["design", "tutorials"],
        wordCount: 1200,
        publishedOffsetDays: 25,
      },
      {
        slug: "productivity-hacks-for-remote-teams",
        title: "Remote Team Productivity: 10 Game-Changing Strategies",
        excerpt:
          "Transform your remote team's efficiency with proven strategies. From async communication to focus rituals, discover what actually works in distributed teams.",
        content: `# Mastering Remote Team Productivity

Remote work isn't just about working from home—it's about reimagining how teams collaborate, communicate, and create value together across time and space.

## The Remote Productivity Paradox

Studies show remote workers can be **13-50% more productive** than their office counterparts, yet many teams struggle with:

- Communication breakdowns
- Lack of spontaneous collaboration
- Difficulty maintaining team culture
- Challenges with accountability

## 10 Strategies That Actually Work

### 1. Master Asynchronous Communication

**Default to async** for most interactions. This means:

- Detailed written updates instead of status meetings
- Clear documentation for all decisions
- Respect for different time zones and work schedules

\`\`\`markdown
## Daily Update Template
**Yesterday**: What I accomplished
**Today**: Current priorities and blockers  
**Help needed**: Specific asks for team members
\`\`\`

### 2. Create Focused Work Blocks

Protect deep work time with structured schedules:

- **9-11 AM**: Deep work (no meetings)
- **11 AM-1 PM**: Collaboration time
- **2-4 PM**: Deep work continues
- **4-5 PM**: Admin and planning

### 3. Establish Communication Protocols

Clear guidelines prevent confusion:

| **Channel** | **Use Case** | **Response Time** |
|-------------|--------------|------------------|
| Slack/Teams | Quick questions | 2-4 hours |
| Email | Formal updates | 24 hours |
| Video call | Complex discussions | Scheduled |
| Phone | Urgent only | Immediate |

### 4. Implement 'Working Out Loud'

Make individual work visible to the team through:

- Shared project boards
- Regular progress updates
- Open documentation practices
- Screen sharing sessions

### 5. Design Intentional Social Interaction

Remote relationships need deliberate nurturing:

- **Coffee chats**: 15-minute informal video calls
- **Show and tell**: Weekly personal interest sharing
- **Virtual co-working**: Cameras on, working together
- **Online team building**: Games, challenges, celebrations

### 6. Optimize Your Physical Environment

Your workspace dramatically impacts productivity:

#### Lighting
- Natural light when possible
- Adjustable desk lamp for tasks
- Bias lighting behind monitor

#### Ergonomics
- External monitor at eye level
- Ergonomic chair and keyboard
- Standing desk option

#### Noise Management
- Noise-cancelling headphones
- White noise or nature sounds
- Separate space for calls

### 7. Use Technology Strategically

The right tools make all the difference:

**Project Management**
- Notion for documentation
- Linear for task tracking  
- Figma for collaborative design

**Communication**
- Loom for async video updates
- Calendly for easy scheduling
- Otter.ai for meeting transcription

### 8. Establish Healthy Boundaries

Remote work requires intentional separation:

- **Start ritual**: Coffee, review goals, update status
- **End ritual**: Review achievements, plan tomorrow, "close" laptop
- **Physical boundaries**: Dedicated workspace, door policies
- **Digital boundaries**: Separate work/personal devices and accounts

### 9. Focus on Outcomes, Not Activity

Measure what matters:

\`\`\`
❌ Hours logged online
❌ Number of meetings attended  
❌ Response time to messages

✅ Goals achieved
✅ Quality of deliverables
✅ Customer satisfaction
✅ Team collaboration effectiveness
\`\`\`

### 10. Invest in Regular Retrospectives

Continuous improvement is essential:

**Weekly Team Retros**
- What went well?
- What could be improved?
- What will we try next week?

**Monthly Process Reviews**
- Are our tools serving us?
- How's team morale?
- What process changes should we make?

## The Compound Effect

These strategies work best when implemented together. Start with 2-3 that resonate most with your team's current challenges, then gradually add others.

Remember: **remote productivity isn't about replicating office culture online—it's about creating something entirely new and better.**

*The future of work is distributed, asynchronous, and outcome-focused. Teams that master these principles will have a significant competitive advantage.*`,
        categories: ["productivity", "lifestyle"],
        wordCount: 800,
        publishedOffsetDays: 20,
      },
      {
        slug: "typescript-advanced-patterns",
        title: "TypeScript Patterns Every Developer Should Master",
        excerpt:
          "Unlock TypeScript's full potential with advanced patterns and techniques. From conditional types to template literals, elevate your type-safe development.",
        content: `# Advanced TypeScript Patterns for Professional Development

TypeScript has evolved far beyond simple type annotations. Modern TypeScript offers powerful features that can transform how you write and maintain code.

## Why Advanced Patterns Matter

Mastering these patterns enables:

- **Better API Design**: Self-documenting, impossible-to-misuse interfaces
- **Improved Developer Experience**: Rich IDE support and autocomplete
- **Runtime Safety**: Catch errors at compile time, not production
- **Code Maintainability**: Refactor with confidence

## Pattern 1: Conditional Types

Conditional types enable type-level programming:

\`\`\`typescript
// Basic conditional type
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;    // true
type B = IsString<number>;    // false

// Practical example: API response handling
type ApiResponse<T> = T extends string 
  ? { success: true; data: T } 
  : { success: false; error: string };

// Usage
function handleResponse<T>(response: ApiResponse<T>) {
  if (response.success) {
    // TypeScript knows response.data exists
    console.log(response.data);
  } else {
    // TypeScript knows response.error exists
    console.error(response.error);
  }
}
\`\`\`

## Pattern 2: Template Literal Types

Generate types from string patterns:

\`\`\`typescript
// Event system with type safety
type EventName = \`on\${Capitalize<string>}\`;
type Handler<T extends EventName> = T extends \`on\${infer E}\` 
  ? (event: { type: Lowercase<E>; data: any }) => void
  : never;

// Usage
type ClickHandler = Handler<'onClick'>;  
// (event: { type: 'click'; data: any }) => void

// CSS-in-JS type safety
type CSSProperty = \`--\${string}\`;
type Theme = Record<CSSProperty, string>;

const theme: Theme = {
  '--primary-color': '#3b82f6',
  '--secondary-color': '#64748b',
  // '--invalid': 'red', // Error: doesn't match pattern
};
\`\`\`

## Pattern 3: Mapped Types for Transformations

Transform existing types systematically:

\`\`\`typescript
// Make all properties optional for PATCH requests
type PartialUpdate<T> = {
  [K in keyof T]?: T[K];
};

// Make all properties readonly for immutable objects
type Immutable<T> = {
  readonly [K in keyof T]: T[K] extends object 
    ? Immutable<T[K]> 
    : T[K];
};

// Extract function parameters
type Parameters<T extends (...args: any) => any> = 
  T extends (...args: infer P) => any ? P : never;

// Usage
function createUser(name: string, age: number, email: string) {
  return { name, age, email };
}

type CreateUserParams = Parameters<typeof createUser>;
// [string, number, string]
\`\`\`

## Pattern 4: Branded Types

Prevent mixing similar types:

\`\`\`typescript
// Brand primitive types for domain safety
type UserId = string & { readonly brand: unique symbol };
type Email = string & { readonly brand: unique symbol };
type Password = string & { readonly brand: unique symbol };

// Constructor functions
function createUserId(id: string): UserId {
  // Validation logic here
  return id as UserId;
}

function createEmail(email: string): Email {
  if (!email.includes('@')) {
    throw new Error('Invalid email');
  }
  return email as Email;
}

// Type-safe usage
function sendEmail(userId: UserId, email: Email) {
  // Implementation
}

// This would cause a compile error:
// sendEmail('user123', 'not-an-email');

// Correct usage:
const userId = createUserId('user123');
const email = createEmail('user@example.com');
sendEmail(userId, email);
\`\`\`

## Pattern 5: Discriminated Unions

Model complex state machines:

\`\`\`typescript
// API loading states
type AsyncState<T, E = Error> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: E };

// Type-safe state handling
function renderUserProfile(state: AsyncState<User>) {
  switch (state.status) {
    case 'idle':
      return <div>Click to load profile</div>;
      
    case 'loading':
      return <div>Loading...</div>;
      
    case 'success':
      // TypeScript knows state.data exists and is User type
      return <div>Welcome, {state.data.name}!</div>;
      
    case 'error':
      // TypeScript knows state.error exists
      return <div>Error: {state.error.message}</div>;
  }
}
\`\`\`

## Pattern 6: Higher-Order Type Functions

Compose complex type transformations:

\`\`\`typescript
// Utility to extract object keys by value type
type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Usage example
interface User {
  id: string;
  name: string;
  age: number;
  isActive: boolean;
  createdAt: Date;
}

type StringKeys = KeysOfType<User, string>;   // 'id' | 'name'
type NumberKeys = KeysOfType<User, number>;   // 'age'
type BooleanKeys = KeysOfType<User, boolean>; // 'isActive'

// Function overloading with type constraints
function updateUser<K extends KeysOfType<User, string>>(
  id: string,
  field: K,
  value: string
): void;

function updateUser<K extends KeysOfType<User, number>>(
  id: string,
  field: K,
  value: number
): void;

function updateUser(id: string, field: keyof User, value: any) {
  // Implementation
}

// Type-safe usage
updateUser('123', 'name', 'John');     // ✓
updateUser('123', 'age', 30);          // ✓
// updateUser('123', 'name', 30);      // ✗ Type error
\`\`\`

## Best Practices

### 1. Start Simple, Add Complexity Gradually

\`\`\`typescript
// Good: Start with basic types
type User = {
  id: string;
  name: string;
};

// Later: Add constraints as needed
type ValidatedUser = User & {
  id: UserId;
  name: NonEmptyString;
};
\`\`\`

### 2. Use Utility Types

Leverage TypeScript's built-in utilities:

\`\`\`typescript
// Instead of manually creating partial types
type UserUpdate = Partial<User>;
type RequiredUser = Required<User>;
type UserEmail = Pick<User, 'email'>;
type UserWithoutId = Omit<User, 'id'>;
\`\`\`

### 3. Document Complex Types

\`\`\`typescript
/**
 * Recursive type that makes all properties and nested properties readonly
 * @template T - The type to make deeply readonly
 * @example
 * type ReadonlyUser = DeepReadonly<User>
 */
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};
\`\`\`

## The TypeScript Advantage

These patterns unlock TypeScript's true power:

- **Compile-time guarantees** prevent entire classes of runtime errors
- **Self-documenting APIs** make code easier to understand and use
- **Refactoring confidence** enables fearless code evolution
- **Enhanced tooling** provides better autocomplete and error detection

*Mastering these patterns transforms TypeScript from a type checker into a powerful development partner.*`,
        categories: ["tech", "tutorials"],
        wordCount: 1000,
        publishedOffsetDays: 18,
      },
    ];

    // Add the remaining 10 posts with rich content...
    const additionalPosts = [
      {
        slug: "minimalist-design-principles",
        title: "The Art of Minimalist Design: Less is More",
        excerpt:
          "Discover how minimalist design principles create powerful, memorable user experiences. Learn to remove the unnecessary and emphasize what matters most.",
        content: `# The Power of Minimalism in Design

Minimalism isn't about removing everything—it's about removing everything that doesn't serve a purpose. In an age of information overload, minimalist design provides clarity, focus, and peace of mind.

## Core Principles of Minimalist Design

### 1. Intentional White Space
White space (or negative space) isn't empty—it's a powerful design tool that:

- **Improves readability** by giving content room to breathe
- **Creates hierarchy** by grouping related elements
- **Directs attention** to what's most important
- **Enhances usability** by making interfaces less overwhelming

### 2. Limited Color Palette
Constraint breeds creativity. A limited color palette:

\`\`\`css
/* Minimalist color scheme */
:root {
  --primary: #000000;
  --secondary: #666666;
  --accent: #0066cc;
  --background: #ffffff;
  --surface: #f8f9fa;
}
\`\`\`

### 3. Typography as a Visual Element
In minimalist design, typography carries more weight:

- **Hierarchy through size and weight**, not decoration
- **Consistent spacing** creates rhythm
- **High-quality typefaces** make every word count

## The Psychology Behind Minimalism

### Cognitive Load Reduction
Our brains can only process so much information at once. Minimalist design reduces cognitive load by:

1. **Eliminating distractions**
2. **Clarifying choices**
3. **Reducing decision fatigue**
4. **Improving focus**

> "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away." — Antoine de Saint-Exupéry

## Practical Application

### Web Design
- Clean navigation with clear labels
- Generous white space around content
- Consistent visual hierarchy
- Fast loading times

### Mobile UI
- Single-purpose screens
- Obvious primary actions
- Minimal form fields
- Intuitive gestures

## Common Minimalism Mistakes

❌ **Confusing sparse with minimal** - Removing too much content
❌ **Ignoring functionality** - Style over substance
❌ **Lack of personality** - Being boring instead of focused
❌ **Poor contrast** - Sacrificing accessibility for aesthetics

## Case Studies in Minimalist Excellence

### Apple
- Product pages focus on the product
- Clean lines and premium materials
- Intuitive interactions

### Medium
- Reading experience is paramount
- Distraction-free writing interface
- Typography-focused design

### Stripe
- Complex functionality made simple
- Clear visual hierarchy
- Purposeful use of color

## Tools for Minimalist Designers

**Design Systems**
- Start with constraints
- Define spacing scales
- Limit font weights and sizes

**Prototyping**
- Focus on core user flows
- Remove unnecessary steps
- Test with real content

*True minimalism isn't about having less—it's about making room for what matters most.*`,
        categories: ["design", "lifestyle"],
        wordCount: 650,
        publishedOffsetDays: 15,
      },
      // ... Continue with remaining posts
    ];

    const allDemoPosts = [...demoPosts, ...additionalPosts];

    for (const p of allDemoPosts) {
      const publishedAt = new Date(now);
      publishedAt.setDate(now.getDate() - p.publishedOffsetDays);

      const readingTime = wordsToReadingTime(p.wordCount);

      const res = await client.query(
        `INSERT INTO posts (slug, title, excerpt, content, word_count, reading_time, is_published, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title RETURNING id`,
        [
          p.slug,
          p.title,
          p.excerpt,
          p.content,
          p.wordCount,
          readingTime,
          true,
          publishedAt.toISOString(),
          publishedAt.toISOString(),
        ]
      );

      const postId = res.rows[0].id;
      for (const c of p.categories) {
        const catId = categoryIds[c] || categoryIds["tech"];
        await client.query(
          `INSERT INTO post_categories (post_id, category_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [postId, catId]
        );
      }
    }

    await client.query("COMMIT");
    console.log("Seed completed");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed", err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
