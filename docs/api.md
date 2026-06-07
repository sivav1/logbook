# API — Multi-Job Time Tracker

---

## 1. Overview

All API routes are Next.js Route Handlers under `/api/`. Shared between the web app and future mobile app. All endpoints require a valid Supabase JWT.

---

## 2. Conventions

### Authentication
- Web: JWT read from cookie via `createRouteHandlerClient`
- Mobile (Phase 5): `Authorization: Bearer <token>` header
- All routes return `401` if session is missing or invalid

### Error Response Shape
```json
{ "error": "Human readable message", "code": "MACHINE_READABLE_CODE" }
```

### Success Response Shape
```json
{ "data": { ... } }
```

### Common Error Codes
| Code | HTTP Status | Meaning |
|---|---|---|
| UNAUTHORISED | 401 | Missing or invalid JWT |
| FORBIDDEN | 403 | Authenticated but not owner of resource |
| NOT_FOUND | 404 | Resource does not exist |
| VALIDATION_ERROR | 422 | Missing or invalid request fields |
| CONFLICT | 409 | Business rule violation (e.g. session already active) |
| INTERNAL_ERROR | 500 | Unexpected server error |

---

## 3. OpenAPI Specification

```yaml
openapi: 3.0.3
info:
  title: Multi-Job Time Tracker API
  version: 1.0.0

servers:
  - url: https://your-domain.com/api
  - url: http://localhost:3000/api

components:
  schemas:
    Error:
      type: object
      properties:
        error:
          type: string
        code:
          type: string

    FieldDefinition:
      type: object
      properties:
        key:
          type: string
        label:
          type: string
        type:
          type: string
          enum: [text, number, odometer, time]
        required:
          type: boolean
        capture:
          type: string
          enum: [start, end, both]

    JobType:
      type: object
      properties:
        id:
          type: string
          format: uuid
        user_id:
          type: string
          format: uuid
        name:
          type: string
        preset:
          type: string
          enum: [uber, bolt, contract, freelance, custom]
        fields:
          type: array
          items:
            $ref: '#/components/schemas/FieldDefinition'
        reminder_threshold_hours:
          type: integer
          default: 8
        created_at:
          type: string
          format: date-time

    Session:
      type: object
      properties:
        id:
          type: string
          format: uuid
        user_id:
          type: string
          format: uuid
        job_id:
          type: string
          format: uuid
        started_at:
          type: string
          format: date-time
        ended_at:
          type: string
          format: date-time
          nullable: true
        data:
          type: object
          additionalProperties: true
        notes:
          type: string
          nullable: true
        reminder_sent_at:
          type: string
          format: date-time
          nullable: true

    AuditLog:
      type: object
      properties:
        id:
          type: string
          format: uuid
        session_id:
          type: string
          format: uuid
        edited_at:
          type: string
          format: date-time
        field_changed:
          type: string
        old_value:
          type: string
        new_value:
          type: string
        note:
          type: string

paths:
  /jobs:
    get:
      summary: List all job types for the authenticated user
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/JobType'
        '401':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
    post:
      summary: Create a new job type
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [name, preset, fields]
              properties:
                name:
                  type: string
                preset:
                  type: string
                  enum: [uber, bolt, contract, freelance, custom]
                fields:
                  type: array
                  items:
                    $ref: '#/components/schemas/FieldDefinition'
                reminder_threshold_hours:
                  type: integer
                  default: 8
      responses:
        '201':
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/JobType'
        '422':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /jobs/{id}:
    put:
      summary: Update a job type
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                fields:
                  type: array
                  items:
                    $ref: '#/components/schemas/FieldDefinition'
                reminder_threshold_hours:
                  type: integer
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/JobType'
        '403':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '404':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
    delete:
      summary: Delete a job type
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '204':
          description: Deleted successfully
        '403':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /sessions:
    get:
      summary: List sessions, filterable by job and date
      parameters:
        - name: job_id
          in: query
          schema:
            type: string
            format: uuid
        - name: from
          in: query
          schema:
            type: string
            format: date
        - name: to
          in: query
          schema:
            type: string
            format: date
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Session'

  /sessions/start:
    post:
      summary: Start a new session
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [job_id]
              properties:
                job_id:
                  type: string
                  format: uuid
                data:
                  type: object
                  description: Start-of-session field values (e.g. start odometer)
      responses:
        '201':
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/Session'
        '409':
          description: A session is already active
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /sessions/{id}/stop:
    post:
      summary: Stop an active session
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                data:
                  type: object
                  description: End-of-session field values (e.g. end odometer, trips)
                notes:
                  type: string
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/Session'
        '404':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /sessions/{id}:
    put:
      summary: Edit a completed session (requires audit note)
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [field, value, note]
              properties:
                field:
                  type: string
                value:
                  type: string
                note:
                  type: string
                  description: Required reason for the edit
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/Session'
                  audit:
                    $ref: '#/components/schemas/AuditLog'
        '422':
          description: Missing audit note
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /sessions/remind:
    post:
      summary: Internal — triggered by Supabase pg_cron to send forgotten session reminders
      description: Not for client use. Protected by CRON_SECRET header.
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  sent:
                    type: integer
```

---

## 4. Preset Field Definitions

Default field definitions shipped with each preset, stored in `job_types.fields` as jsonb.

### Uber / Bolt
```json
[
  { "key": "start_odometer", "label": "Start Odometer (km)", "type": "odometer", "required": true, "capture": "start" },
  { "key": "end_odometer", "label": "End Odometer (km)", "type": "odometer", "required": true, "capture": "end" },
  { "key": "trips", "label": "Trips Completed", "type": "number", "required": true, "capture": "end" },
  { "key": "earnings", "label": "Earnings (NZD)", "type": "number", "required": false, "capture": "end" }
]
```

### Contract / Employed
```json
[
  { "key": "employer", "label": "Employer / Client", "type": "text", "required": true, "capture": "start" }
]
```

### Freelance
```json
[
  { "key": "client", "label": "Client", "type": "text", "required": true, "capture": "start" },
  { "key": "project", "label": "Project", "type": "text", "required": false, "capture": "start" },
  { "key": "hourly_rate", "label": "Hourly Rate (NZD)", "type": "number", "required": false, "capture": "start" }
]
```
