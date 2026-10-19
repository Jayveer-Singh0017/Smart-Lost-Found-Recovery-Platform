# Smart Lost & Found Recovery Platform - REST API Reference

All API endpoints are prefixed with `/api` and conform to standard REST conventions and RFC 7807 problem details.

- **Base URL (Local)**: `http://localhost:8080/api`
- **Interactive Swagger UI**: `http://localhost:8080/swagger-ui/index.html`
- **OpenAPI JSON Spec**: `http://localhost:8080/v3/api-docs`

---

## 1. Authentication & Security

Endpoints marked with 🔒 require an `Authorization` header with a valid JWT Bearer token:
```http
Authorization: Bearer <your_jwt_token>
```

### Standard Response Envelope
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-10-17T19:00:00Z"
}
```

### Paginated Response Envelope
```json
{
  "success": true,
  "message": null,
  "data": {
    "content": [ ... ],
    "page": 0,
    "size": 10,
    "totalElements": 42,
    "totalPages": 5,
    "last": false
  },
  "timestamp": "2026-10-17T19:00:00Z"
}
```

### RFC 7807 Problem Detail Error Response
```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "detail": "Email is already registered",
  "instance": "/api/auth/register",
  "timestamp": "2026-10-17T19:00:00Z"
}
```

---

## 2. Authentication Endpoints

### Register New Account
- **POST** `/auth/register`
- **Body**:
  ```json
  {
    "fullName": "Jane Doe",
    "email": "jane.doe@example.com",
    "password": "Password@123",
    "phone": "+1-555-0199"
  }
  ```
- **Response**: `201 Created` with `AuthResponse` (contains token, user info).

### Login
- **POST** `/auth/login`
- **Body**:
  ```json
  {
    "email": "admin@smartlostfound.com",
    "password": "Admin@123456"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5c...",
      "tokenType": "Bearer",
      "user": {
        "id": 1,
        "email": "admin@smartlostfound.com",
        "fullName": "System Administrator",
        "role": "ROLE_ADMIN"
      }
    }
  }
  ```

### Get Current User Profile 🔒
- **GET** `/auth/me`
- **Response**: `200 OK` with user details.

---

## 3. Categories Endpoints

### List All Active Categories
- **GET** `/categories` (Public)
- **Response**: `200 OK` with list of category objects (id, name, slug, description, iconName).

---

## 4. Item Reports Endpoints

### Search & Browse Items
- **GET** `/items` (Public)
- **Query Parameters**:
  - `query`: Text search in title and description
  - `type`: `LOST` or `FOUND`
  - `categoryId`: Long
  - `city`: String
  - `status`: `OPEN`, `CLAIM_PENDING`, `RESOLVED`, `REJECTED`, `ARCHIVED`
  - `startDate`, `endDate`: ISO Date (`YYYY-MM-DD`)
  - `page`: Integer (default 0)
  - `size`: Integer (default 10)
  - `sortBy`: Field name (`createdAt`, `dateOccurred`)
  - `sortDir`: `asc` or `desc`

### Get Recent Items Showcase
- **GET** `/items/recent` (Public)
- **Response**: Up to 6 most recent active listings for landing page showcase.

### Get Item by ID
- **GET** `/items/{id}` (Public)
- **Response**: Detailed item report including images, category, reporter info, and verification question (secret answer is masked).

### Create Item Report 🔒
- **POST** `/items`
- **Body**:
  ```json
  {
    "type": "LOST",
    "title": "MacBook Pro 14 M2 Silver",
    "description": "Left inside a black incase sleeve near terminal 2 seating area.",
    "categoryId": 1,
    "locationCity": "San Francisco",
    "locationAddress": "SFO Airport Terminal 2",
    "locationVenue": "Gate 42 Waiting Lounge",
    "dateOccurred": "2026-10-15",
    "brand": "Apple",
    "primaryColor": "Silver",
    "secretQuestion": "What sticker is on the lid?",
    "secretAnswer": "Docker whale sticker"
  }
  ```
- **Response**: `201 Created`

### Update Item Report 🔒
- **PUT** `/items/{id}`
- **Body**:
  ```json
  {
    "title": "Updated Item Title",
    "categoryId": 1,
    "description": "Updated detailed description of the lost or found item",
    "distinguishingCharacteristics": "Updated characteristics or markings",
    "city": "Seattle",
    "locationAddress": "Updated address details",
    "incidentDate": "2026-10-15",
    "contactEmail": "user@example.com",
    "contactPhone": "+1-555-0199"
  }
  ```
- **Response**: `200 OK` with updated `ItemReportResponse`.

### Upload Item Image 🔒
- **POST** `/items/{id}/images`
- **Content-Type**: `multipart/form-data`
- **Param**: `file` (Image binary: JPG, PNG, WEBP, max 10MB)
- **Response**: `201 Created` with `ItemImageDto`.

### Delete Item Image 🔒
- **DELETE** `/items/{id}/images/{imageId}`
- **Response**: `200 OK` (Removes photo record and deletes physical file from storage).

### Serve Uploaded Image
- **GET** `/items/images/{filename}` (Public)
- **Response**: Binary image stream (`image/jpeg`, `image/png`, `image/webp`).

### Flag Item for Moderation 🔒
- **POST** `/items/{id}/flag`
- **Body**:
  ```json
  {
    "reason": "Scam or Fraud",
    "details": "This exact image was copied from an external forum."
  }
  ```

---

## 5. Smart Matching Engine

### Find Potential Matches for an Item 🔒
- **GET** `/matching/item/{itemId}?minScore=30.0`
- **Response**: List of opposite-type candidates ordered by compatibility score descending.
  ```json
  {
    "success": true,
    "data": [
      {
        "matchedItem": { ... },
        "matchScore": 88.5,
        "explanation": {
          "categoryMatch": true,
          "categoryScore": 100.0,
          "textSimilarityScore": 84.2,
          "dateProximityScore": 100.0,
          "locationProximityScore": 90.0,
          "attributeMatchScore": 100.0,
          "justificationReasons": [
            "Same category: Electronics",
            "High keyword overlap: MacBook, Pro, Silver",
            "Dates occurred within 24 hours",
            "Same city (San Francisco) and matching venue tokens",
            "Matching brand: Apple"
          ]
        }
      }
    ]
  }
  ```

---

## 6. Claim Lifecycle & Verification

### Submit an Ownership Claim 🔒
- **POST** `/claims`
- **Body**:
  ```json
  {
    "itemReportId": 1,
    "proofDescription": "I can unlock the device with my passcode and provide the original Best Buy purchase invoice.",
    "secretAnswerAttempt": "Docker whale sticker"
  }
  ```
- **Response**: `201 Created`

### Review Claim (Approve or Reject) 🔒
- **POST** `/claims/{id}/review`
- **Body**:
  ```json
  {
    "action": "APPROVE",
    "reviewerNotes": "Proof verified and confirmed with serial number match."
  }
  ```
- **Notes**: Approving transitions the item to `RESOLVED` and automatically rejects all other competing claims for this item.

### Get My Claims 🔒
- **GET** `/claims/my`
- Returns claims submitted by the current authenticated user.

### Get Claims for My Reported Items 🔒
- **GET** `/claims/for-my-items`
- Returns incoming claims requiring verification by the item finder.

---

## 7. Notifications

### Get User Notifications 🔒
- **GET** `/notifications`
- **Query**: `page=0&size=10`

### Get Unread Notification Count 🔒
- **GET** `/notifications/unread-count`
- **Response**: `{ "count": 3 }`

### Mark Notification as Read 🔒
- **PATCH** `/notifications/{id}/read`

### Mark All as Read 🔒
- **PATCH** `/notifications/read-all`

---

## 8. Admin Operations (Requires `ROLE_ADMIN`) 🔒

### Analytics & System Metrics
- **GET** `/admin/dashboard/stats`
  - Returns counts: total items, lost, found, open, resolved, total claims, pending claims, total users, flagged items.
- **GET** `/admin/dashboard/trends`
  - Returns daily report creation counts for the last 14 days.
- **GET** `/admin/dashboard/category-distribution`
  - Returns breakdown of items across categories.

### User Management
- **GET** `/admin/users` (Paginated list of users)
- **PATCH** `/admin/users/{id}/toggle-status` (Enable or ban user)

### Moderation Queue
- **GET** `/admin/moderation` (List pending flagged reports)
- **POST** `/admin/moderation/{id}/action` (Dismiss or ban item)

### System Audit Logs
- **GET** `/admin/audit-logs` (Paginated immutable activity logs)
