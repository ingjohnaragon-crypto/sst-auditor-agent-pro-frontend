# plan-backend-ticket

Ticket ID: $ARGUMENTS

## Goal
Generate a step-by-step implementation plan for a Jira ticket, ready to hand
off to a developer for autonomous implementation on the active stack.

## Pre-flight checklist

1. Read `openspec/config.yaml` and resolve:
   - Active stack (`stack:` key)
   - Stack agent path and load it
   - Stack standards path and load it
   - Tooling commands: `build_command`, `test_command`, `run_command`, `coverage_command`
   - Side suffix from stack: `frontend-*` → `frontend`, otherwise `backend` (use `{{side}}`)
2. Read `ai-specs/specs/base-standards.mdc`
3. Read any existing plans under `ai-specs/changes/planes/` for related context
4. Fetch ticket details from Jira MCP (if available) or from a provided description

## Process

1. Adopt the role defined in the active stack agent
2. Analyze the ticket: identify affected layers for the active stack
3. Propose the implementation plan following the output format below
4. Save the plan at `ai-specs/changes/planes/<ticket-id>/<ticket-id>_{{side}}.md`
5. **Do not write any implementation code — plan only**

## Output format

Save a markdown file at `ai-specs/changes/planes/<ticket-id>/<ticket-id>_{{side}}.md` with this structure:

---

### `# Implementation Plan: <TICKET-ID> <Feature Name>`

### `## 1. Overview`
Brief description of the feature and relevant architecture principles.
State the active stack.

### `## 2. Architecture Context`
- Active stack: `<stack>` (`<label>`)
- Layers involved and which files are affected per layer

### `### Subtask Mapping`
If the `## Subtasks` context block lists Jira subtasks, add a table mapping each
subtask to the Implementation Step(s) below that fulfill it:

| Subtask key | Summary | Implementation Step(s) |
|---|---|---|
| `<SUBTASK-KEY>` | `<summary>` | Step `<n>`, Step `<n>` |

If the context block reports no subtasks, write: "No subtasks — plan derived
directly from the HU."

### `## 3. Implementation Steps`

#### Step 0: Create Feature Branch
- **Action**: Create and switch to a new feature branch
- **Branch**: `feature/<ticket-id>-{{side}}`
- **Commands**:
  ```bash
  git checkout develop && git pull origin develop
  git checkout -b feature/<ticket-id>-{{side}}
  ```

#### Step 1: [Schema Migration / Models — if needed]
- File: migration or model path (stack-specific location)
- Content: schema or model changes

#### Step 2: [Domain Entity / Model]
- File: domain/model file path
- Changes: new fields, factory methods, domain methods

#### Step 3: [Repository / Data Access]
- File: repository or data-access path
- Changes: new methods required

#### Step 4: [DTOs / Types]
- Files: request/response DTO or TypeScript interface paths
- Fields and validation rules

#### Step 5: [Service]
- File: service file path
- Method signature and business logic summary

#### Step 6: [Controller / Router / Component]
- File: presentation layer file path
- HTTP method/path or UI surface contract

#### Step 7: [Exception / Error Handling]
- New domain exceptions or UI error mappings

#### Step 8: [Unit Tests]
- Test file paths
- Cases to cover: happy path, validation error, not found, conflict, edge cases

#### Step N: Update Technical Documentation
- `ai-specs/specs/data-model.md` — if schema changed
- `ai-specs/specs/api-spec.yml` — if endpoints changed
- Relevant standards file — if libraries or patterns changed

---

### `## 4. Implementation Order`
Numbered list of steps in sequence. Must start with Step 0 and end with documentation.

### `## 5. Testing Checklist`
Post-implementation verification:
- [ ] `{{test_command}}` passes with 0 failures
- [ ] `{{coverage_command}}` shows >= 90%
- [ ] All new endpoints/surfaces manually tested (happy path + all error cases)
- [ ] Existing tests not broken

### `## 6. Tooling Reference`
Commands resolved from `openspec/config.yaml` for the active stack:

| Purpose | Command |
|---|---|
| Build | `{{build_command}}` |
| Test | `{{test_command}}` |
| Run | `{{run_command}}` |
| Coverage | `{{coverage_command}}` |

### `## 7. Error Response Format`
```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Human-readable description",
  "details": ["field: validation message"]
}
```
HTTP mapping: 400 VALIDATION_ERROR | 404 NOT_FOUND | 409 CONFLICT | 422 BUSINESS_RULE_VIOLATION | 500 INTERNAL_ERROR

### `## 8. Dependencies`
New libraries or tools required (if any), with install instructions for the active stack.

### `## 9. Notes`
Business rules, constraints, and important reminders.
Branch naming must use `feature/<ticket-id>-{{side}}` (derived from the active stack — never hardcode `-backend` on frontend stacks).

### `## 10. Implementation Verification Checklist`
- [ ] Code quality: no compilation errors, linting passes
- [ ] Architecture: follows active stack agent and standards
- [ ] Tests: all green, coverage >= 90%
- [ ] Documentation: data-model.md, api-spec.yml, and standards files updated as needed
- [ ] Branch: `feature/<ticket-id>-{{side}}`

---

## Final message format

Your final message must include the plan file path:

> I've created a plan at `ai-specs/changes/planes/<ticket-id>/<ticket-id>_{{side}}.md`.
> Please review it before proceeding with implementation.
