---
title: "Pets API Reference"
description: "A simple pet store API for demonstration purposes. Shows basic CRUD operations for managing pets."
date: 2025-01-03
lastmod: 2025-01-03
draft: false
type: "openapi"
api_spec: "basicApi.yaml"
weight: 20
toc: true
---

This is a simple demonstration API for managing pets in a pet store. It showcases basic REST API patterns and serves as an example of OpenAPI documentation.

## Overview

The Pets API provides endpoints for:
- Listing all pets with pagination support
- Retrieving individual pet details
- Creating new pet records
- Updating existing pets
- Deleting pets from the system

## Quick Start

### List All Pets

```bash
curl -X GET "https://api.example.com/pets" \
  -H "Accept: application/json"
```

### Get a Specific Pet

```bash
curl -X GET "https://api.example.com/pets/123" \
  -H "Accept: application/json"
```

### Create a New Pet

```bash
curl -X POST "https://api.example.com/pets" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fluffy",
    "species": "cat",
    "age": 3
  }'
```

## Data Models

### Pet Object

```json
{
  "id": "string",
  "name": "string",
  "species": "string",
  "age": "integer",
  "owner": {
    "name": "string",
    "email": "string"
  }
}
```

## Pagination

List endpoints support pagination using query parameters:
- `page`: Page number (starts at 1)
- `limit`: Number of items per page (max 100)

Example:
```
GET /pets?page=2&limit=20
```

## Error Codes

- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Pet not found
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server error