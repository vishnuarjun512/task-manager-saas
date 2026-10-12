# Orbit Workspace API Contract

This guide describes the API the frontend calls when `NEXT_PUBLIC_API_URL` is configured, plus the request/response contract the backend should implement. The frontend sends JSON with cookies (`credentials: "include"`). Use HTTPS in production.

When the API URL is unset, workspace/project/task forms use the existing mock stores. When it is set, successful API responses update the local Zustand cache; failed calls show an error and do not pretend that a remote mutation succeeded. Seeded project/task state remains available while backend reads are loading.

## Conventions

- IDs for `workspace_id`, `project_id`, `task_id`, and `user_id` are database IDs. `public_id` is only for a user's human-readable connection lookup.
- JSON request and response fields use the database's `snake_case` names.
- Dates use ISO strings: `YYYY-MM-DD` for `DATE`; ISO 8601 timestamps with timezone for `TIMESTAMPTZ`.
- Protected routes derive the actor from the session cookie. Never trust a request's `created_by`, `added_by`, `assigned_by`, or claimed workspace membership.
- Return JSON errors such as `{"error":"forbidden","message":"You do not have permission to edit this project."}`. The client surfaces `message` (or `error`); use `401` for expired/invalid sessions, `403` for permission failures, `404` for missing resources, and `422` for invalid input.
- All project, member, and task reads/writes must validate workspace membership and relation ownership in the backend.

## Routes Already Called by the Frontend

These existing paths are preserved to avoid breaking the working API integration.

| Method and path | Called from / when | Request JSON | Successful response |
| --- | --- | --- | --- |
| `POST /auth/login` | Login form submit | `{"email":"person@example.com","password":"..."}` | `{"user":{...},"message":"..."}`; set the session cookie. The user object includes `user_id`, `email`, `username`, `full_name`, and `created_at`. |
| `POST /auth/register` | Registration form submit | `{"email":"person@example.com","password":"..."}` | `{"message":"..."}`; create the account and any initial profile. |
| `POST /auth/forgot-password` | Password reset form submit | `{"email":"person@example.com"}` | `{"message":"..."}`; do not disclose whether that email is registered. |
| `POST /auth/refresh` | Automatically after a protected request receives `401` | No body; session cookie is sent | Any successful 2xx response refreshes the cookie. The failed original request is retried once. |
| `GET /me` | Workspace shell loads, including after a page reload | None | `{"user":User,"profile":Profile,"preferences":Preferences,"workspaces":[Workspace,...]}`. The shell hydrates the authenticated user, profile, and workspace list; it then fetches projects for the active workspace. |
| `GET /workspace` | Workspace manager opens | None | `{"workspaces":[Workspace,...]}`. Workspace fields: `workspace_id` (or `id`), `name`, `description`, `created_at`, `created_by`, `updated_at`. |
| `POST /workspace` | Workspace create form submit | `{"name":"Studio North","description":"Design and brand work"}` | `{"workspace":Workspace}` (or the Workspace object itself). The returned `workspace_id` is required; the client must not invent the server ID. |
| `PATCH /workspace/:workspace_id` | Existing workspace edit submit | `{"name":"Studio North","description":"Updated description"}` | `{"workspace":Workspace}` or `204 No Content`. |
| `DELETE /workspace/:workspace_id` | Confirm workspace deletion | None | `204 No Content` (or a JSON success result). Prefer archive semantics; if deletion cascades, the server must apply the product's confirmation/authorization policy. |
| `GET /projects/:workspace_id` | Project list opens, or a project edit/create needs refreshed project data | None | `{"projects":[Project,...]}`. Project records use the database shape below and may include `project_members` or `members` as user IDs or `{"user_id":"..."}` records. |
| `POST /projects` | Project create form submit | Project JSON shown below | `{"project":Project}` or an object containing `project_id`/`id`. The client reloads the workspace project list after create. |
| `DELETE /projects/:project_id` | Confirm project deletion | None | `204 No Content` (or a JSON success result). |
| `GET /users?public_id=ORB-2048` | Connection form searches the entered public Orbit ID | None | `{"user":{"user_id":"8a1...","public_id":"ORB-2048","display_name":"Sarah Lee","email":"sarah@example.com"}}`. Return only safe directory fields. |
| `GET /connections` | Connection page, project editor, or task editor needs connected people | None | `{"connections":[ConnectionView,...]}`. Include accepted connections and pending requests visible to the caller. |
| `POST /connections/requests` | Send connection request after person lookup | `{"public_id":"ORB-2048"}` | `{"connection":ConnectionView}`. Resolve the recipient server-side and reject self/duplicate requests. |
| `POST /connections/requests/:request_id/accept` | Accept an incoming pending request | None | `204 No Content` (or updated ConnectionView). Only the recipient may accept. |
| `POST /connections/requests/:request_id/decline` | Decline an incoming pending request | None | `204 No Content` (or updated ConnectionView). Only the recipient may decline. |
| `DELETE /connections/:connection_id` | Cancel an outgoing request or remove an accepted connection | None | `204 No Content`. Authorize cancellation/removal against the caller and connection state. |

### Workspace response shape

```json
{
  "workspace": {
    "workspace_id": "c3e...",
    "name": "Studio North",
    "description": "Design and brand work",
    "created_at": "2026-10-12T10:00:00Z",
    "created_by": "8a1...",
    "updated_at": "2026-10-12T10:00:00Z"
  }
}
```

### Project response shape

```json
{
  "project_id": "1fc...",
  "workspace_id": "c3e...",
  "name": "Website Redesign",
  "description": "Refresh the marketing site.",
  "project_color": "bg-violet-500",
  "status": "active",
  "visibility": "workspace",
  "start_date": "2026-10-01",
  "due_date": "2026-11-01",
  "created_by": "8a1...",
  "created_at": "2026-10-01T09:00:00Z",
  "updated_at": "2026-10-12T10:00:00Z",
  "project_members": [{"user_id": "8a1..."}]
}
```

The list route wraps records in a `projects` array. `progress` is a frontend-derived display value and is not part of the supplied projects table.

## Routes Newly Wired for Projects and Tasks

| Method and path | Called from / when | Request JSON | Successful response |
| --- | --- | --- | --- |
| `PATCH /projects/:project_id` | Existing project form submits | Mutable project fields as shown below | Updated project JSON or `204 No Content`. |
| `PUT /projects/:project_id/members` | Project form submits, immediately after project create/update | `{"members":[{"user_id":"8a1..."},{"user_id":"9b2..."}]}` | `{"project_members":[{"workspace_id":"...","project_id":"...","user_id":"...","added_by":"...","joined_at":"..."}]}` or `204 No Content`. Derive workspace and actor on the server. Replace the project's membership set transactionally. |
| `GET /projects/:project_id/tasks` | Task list/board opens for a workspace; the frontend requests each visible project's tasks | None | `{"tasks":[Task,...]}`. Return database-shaped records in the same project. |
| `GET /tasks/:task_id` | A task edit URL is opened and the task is not in the local store | None | `{"task":Task}`. Include `workspace_id`, `project_id`, and the project in the workspace's loaded project list so the editor can resolve its display context. |
| `POST /projects/:project_id/tasks` | Task create form submits | Task JSON shown below | `{"task":Task}` with the created IDs and timestamps. |
| `PATCH /tasks/:task_id` | Task edit submits, a task is completed/reopened, or a board card is moved | Full mutable task JSON for edit; `{"status":"done"}` for status-only change | `{"task":Task}` or `204 No Content`. On status changes, set/clear `completed_at` on the server. |
| `DELETE /tasks/:task_id` | Confirm task deletion | None | `204 No Content` (or a JSON success result). |

Project create body:

```json
{
  "workspace_id": "c3e...",
  "name": "Website Redesign",
  "description": "Refresh the marketing site.",
  "project_color": "bg-violet-500",
  "status": "active",
  "visibility": "workspace",
  "start_date": "2026-10-01",
  "due_date": "2026-11-01"
}
```

Project update uses the same fields, with `workspace_id` included if project workspace moves are allowed. `due_date` is `null` when no deadline is set.

Task response shape:

```json
{
  "task_id": "fd1...",
  "workspace_id": "c3e...",
  "project_id": "1fc...",
  "parent_task_id": null,
  "title": "Finalize homepage copy",
  "description": "Review copy with the content team.",
  "status": "in_progress",
  "priority": "high",
  "assignee_id": "8a1...",
  "created_by": "8a1...",
  "start_date": "2026-10-07T09:00:00Z",
  "due_date": "2026-10-13T17:00:00Z",
  "completed_at": null,
  "position": 10,
  "created_at": "2026-10-03T10:15:00Z",
  "updated_at": "2026-10-12T10:00:00Z"
}
```

Task create/edit bodies use `workspace_id`, `project_id`, `parent_task_id`, `title`, `description`, `status`, `priority`, `assignee_id`, `start_date`, `due_date`, and `position`. Validate that the supplied workspace matches the selected project; the server supplies `created_by` from the session. The edit form currently supports multiple responsible people, but the supplied `tasks` schema has only one `assignee_id`; this frontend sends the first assignee only. Add a task-assignees relation and change the request to an `assignee_ids` array before expecting multi-assignee persistence.

## Database and UI Gaps to Resolve

1. The supplied migrations create `project_members`, but the frontend's project role columns/permissions are not represented in those tables. The member route above persists membership only. If role-based project permissions must survive reloads or be enforced by the server, add a `project_roles` table and a `role_id` (or equivalent) to `project_members`; enforce permissions server-side.
2. Project form connected-user IDs must be actual `workspace_members.user_id` values. Do not send public Orbit IDs such as `ORB-2048` as foreign keys.
3. The UI supports local task scheduling, invitations, notifications, profile/preferences, and activity. Those screens do not yet call APIs. Recommended routes are listed below so these features can become server-backed as follow-up work.
4. The projects migration declares a unique constraint on `project_key`, but that column is not declared in the shown `projects` table. Add the column or remove/fix the constraint before running the migration.
5. The migrations do not define `task_schedules`, `project_roles`, task assignees (many-to-many), invitations, or feedback tables. Add migrations for a feature before enabling server persistence for it.

## Recommended Next Routes (Not Yet Called)

| Feature | Suggested routes | Payload/data |
| --- | --- | --- |
| Logout | `POST /auth/logout` | Revoke the server-side session and clear the session cookie; the current logout action only clears client state/navigates away. |
| Profile and preferences | `PATCH /me/profile`; `PATCH /me/preferences` | Profile patch accepts display fields; preferences patch accepts notification flags, timezone, week start, theme, and active workspace ID. |
| Workspace invitations | `GET/POST /workspaces/:workspace_id/invitations`; `POST /invitations/:token/accept`; `DELETE /invitations/:invitation_id` | Create accepts `{"email":"person@example.com","role":"member"}`. Send mail only after storing an expiring, hashed token; create workspace membership on acceptance. |
| Calendar schedule | `PUT/DELETE /tasks/:task_id/schedule` | Put accepts `{"scheduled_date":"2026-10-14","scheduled_time":"09:30","timezone":"America/Los_Angeles"}`; do not conflate schedule time with task deadline. |
| Activity and notifications | `GET /workspaces/:workspace_id/activity?cursor=...`; `GET /notifications`; `PATCH /notifications/:notification_id` | Return newest-first paginated activity and notifications; patch notification with `{"read":true}` or a `read_at` timestamp. |
| Feedback | `POST /feedback` | Accept `{"topic":"bug_report","message":"...","email":"optional@example.com"}` and return a receipt ID/status. |

Connection list/lookup records should use this normalized view shape so the current frontend can assign internal user IDs rather than public IDs:

```json
{
  "connection_id": "2ab...",
  "person_id": "8a1...",
  "public_id": "ORB-2048",
  "display_name": "Sarah Lee",
  "email": "sarah@example.com",
  "direction": "outgoing",
  "status": "accepted"
}
```

For request rows, `direction` is from the authenticated user's perspective; use `incoming` or `outgoing`. Status values are `pending`, `accepted`, or `declined`; the frontend displays `accepted` as `connected`.

## Suggested Server Call Flow

1. Authenticate the request from its secure cookie and determine the actor.
2. Validate input and authorize the actor against the workspace/project.
3. Write the entity and relational rows in one transaction; create an activity event in that transaction or through a reliable outbox.
4. Return the canonical database-shaped entity, including generated IDs and timestamps. The frontend then updates its local cache from that response.
5. Return explicit status codes and structured error bodies for validation, authorization, conflict, and not-found cases.
