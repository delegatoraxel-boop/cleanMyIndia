# Dustbin Tracking API Documentation

## Base URL
```
http://localhost:4000
```

## Endpoints

### 1. Get All Dustbins
**GET** `/api/dustbins`

Retrieves all dustbins from the database.

**Query Parameters:**
- `status` (optional) - Filter by status: `active`, `full`, `damaged`, `removed`

**Example Request:**
```bash
curl http://localhost:4000/api/dustbins
```

**Example Response:** `200 OK`
```json
{
  "count": 3,
  "dustbins": [
    {
      "id": 1,
      "latitude": 28.6139,
      "longitude": 77.209,
      "address": "Connaught Place, New Delhi",
      "description": "Large dustbin near metro station",
      "status": "active",
      "reportedBy": "user123",
      "createdAt": "2025-11-23T16:04:00.000Z",
      "updatedAt": "2025-11-23T16:04:00.000Z"
    }
  ]
}
```

---

### 2. Get Single Dustbin
**GET** `/api/dustbins/:id`

Retrieves a specific dustbin by ID.

**Example Request:**
```bash
curl http://localhost:4000/api/dustbins/1
```

**Example Response:** `200 OK`
```json
{
  "id": 1,
  "latitude": 28.6139,
  "longitude": 77.209,
  "address": "Connaught Place, New Delhi",
  "description": "Large dustbin near metro station",
  "status": "active",
  "reportedBy": "user123",
  "createdAt": "2025-11-23T16:04:00.000Z",
  "updatedAt": "2025-11-23T16:04:00.000Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": "Dustbin not found",
  "id": 999
}
```

---

### 3. Create New Dustbin
**POST** `/api/dustbins`

Creates a new dustbin location.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "address": "Connaught Place, New Delhi",
  "description": "Large dustbin near metro station",
  "reportedBy": "user123"
}
```

**Required Fields:**
- `latitude` (number) - Must be between -90 and 90
- `longitude` (number) - Must be between -180 and 180

**Optional Fields:**
- `address` (string) - Max 500 characters
- `description` (string) - Max 1000 characters
- `reportedBy` (string)

**Example Request:**
```bash
curl -X POST http://localhost:4000/api/dustbins \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 28.6139,
    "longitude": 77.2090,
    "address": "Connaught Place, New Delhi",
    "description": "Large dustbin near metro station",
    "reportedBy": "user123"
  }'
```

**Example Response:** `201 Created`
```json
{
  "id": 4,
  "latitude": 28.6139,
  "longitude": 77.209,
  "address": "Connaught Place, New Delhi",
  "description": "Large dustbin near metro station",
  "status": "active",
  "reportedBy": "user123",
  "createdAt": "2025-11-23T16:10:00.000Z",
  "updatedAt": "2025-11-23T16:10:00.000Z"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "error": "Invalid coordinates",
  "details": "Latitude must be between -90 and 90"
}
```

---

### 4. Update Dustbin
**PUT** `/api/dustbins/:id`

Updates an existing dustbin. All fields are optional.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "latitude": 28.6140,
  "longitude": 77.2091,
  "address": "Updated address",
  "description": "Updated description",
  "status": "full"
}
```

**Valid Status Values:**
- `active`
- `full`
- `damaged`
- `removed`

**Example Request:**
```bash
curl -X PUT http://localhost:4000/api/dustbins/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "full",
    "description": "Dustbin is full, needs collection"
  }'
```

**Example Response:** `200 OK`
```json
{
  "id": 1,
  "latitude": 28.6139,
  "longitude": 77.209,
  "address": "Connaught Place, New Delhi",
  "description": "Dustbin is full, needs collection",
  "status": "full",
  "reportedBy": "user123",
  "createdAt": "2025-11-23T16:04:00.000Z",
  "updatedAt": "2025-11-23T16:15:00.000Z"
}
```

---

### 5. Delete Dustbin
**DELETE** `/api/dustbins/:id`

Deletes a dustbin from the database.

**Example Request:**
```bash
curl -X DELETE http://localhost:4000/api/dustbins/1
```

**Example Response:** `204 No Content`

**Error Response:** `404 Not Found`
```json
{
  "error": "Dustbin not found",
  "id": 999
}
```

---

## Frontend Integration Examples

### JavaScript/Fetch API

```javascript
// Get all dustbins
async function getAllDustbins() {
  const response = await fetch('http://localhost:4000/api/dustbins');
  const data = await response.json();
  return data.dustbins;
}

// Create new dustbin
async function createDustbin(latitude, longitude, address, description) {
  const response = await fetch('http://localhost:4000/api/dustbins', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      latitude,
      longitude,
      address,
      description,
      reportedBy: 'frontend-user'
    })
  });
  return await response.json();
}

// Update dustbin status
async function updateDustbinStatus(id, status) {
  const response = await fetch(`http://localhost:4000/api/dustbins/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status })
  });
  return await response.json();
}

// Delete dustbin
async function deleteDustbin(id) {
  await fetch(`http://localhost:4000/api/dustbins/${id}`, {
    method: 'DELETE'
  });
}
```

### React Example with Map

```jsx
import { useState, useEffect } from 'react';

function DustbinMap() {
  const [dustbins, setDustbins] = useState([]);

  useEffect(() => {
    fetchDustbins();
  }, []);

  async function fetchDustbins() {
    const response = await fetch('http://localhost:4000/api/dustbins');
    const data = await response.json();
    setDustbins(data.dustbins);
  }

  async function addDustbin(lat, lng) {
    const response = await fetch('http://localhost:4000/api/dustbins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: lat,
        longitude: lng,
        reportedBy: 'map-user'
      })
    });
    
    if (response.ok) {
      fetchDustbins(); // Refresh the list
    }
  }

  return (
    <div>
      {/* Render map with dustbins */}
      {dustbins.map(dustbin => (
        <Marker 
          key={dustbin.id}
          position={[dustbin.latitude, dustbin.longitude]}
          title={dustbin.address}
        />
      ))}
    </div>
  );
}
```

---

## Error Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful deletion) |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## CORS

CORS is enabled for all origins. The frontend can make requests from any domain.

---

## Testing with PowerShell

```powershell
# Get all dustbins
Invoke-RestMethod -Uri "http://localhost:4000/api/dustbins" -Method Get

# Create new dustbin
$body = @{
    latitude = 28.6139
    longitude = 77.2090
    address = "Test Location"
    description = "Test dustbin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/dustbins" -Method Post -Body $body -ContentType "application/json"

# Update dustbin
$updateBody = @{
    status = "full"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/dustbins/1" -Method Put -Body $updateBody -ContentType "application/json"

# Delete dustbin
Invoke-RestMethod -Uri "http://localhost:4000/api/dustbins/1" -Method Delete
```
