---
name: API Usage Generator
description: A skill to generate comprehensive API documentation for other AI agents, including project layout, route details, and usage examples.
---

# API Usage Generator

This skill guides you in creating a detailed Markdown documentation file for a project's API, specifically tailored for consumption by other AI agents.

## Objective

Create a single Markdown file (e.g., `API_AGENT_GUIDE.md`) that makes the API immediately usable by another AI.

## Instructions

### 1. Project Overview & Layout

Start the document with a high-level overview of the project structure.
- **Project Structure**: List key files and folders relevant to the API.
- **Route Mapping**: Create a table or list of all API routes.
  - Include the **HTTP Method**.
  - Include the **Endpoint Path**.
  - **CRITICAL**: Include the specific **File Path** and **Line Number Range** (e.g., `app/api/endpoints/users.py:25-50`) where the route is defined. This allows the consuming agent to look up the source code if needed.

### 2. Detailed Route Descriptions

For *every* API route identified, provide a detailed section containing:
- **Method & Endpoint**: Clear header (e.g., `POST /api/v1/users`).
- **Description**: A brief summary of what the endpoint does.
- **When to Use**: A specific scenario description explaining *why* and *when* an agent should call this endpoint.
- **Request Specification**:
  - **Headers**: Required headers (e.g., `Authorization`, `Content-Type`).
  - **Path Parameters**: Description and type.
  - **Query Parameters**: Description, type, and if optional/required.
  - **Body**: JSON structure with field descriptions and types.
- **Response Specification**:
  - **Success Response**: Status code and JSON schema/example.
  - **Error Responses**: Common error codes and their meanings.

### 3. Usage Examples

For *each* route, provide **2 to 3 distinct examples** of how to call it.
- **Context**: Briefly describe the scenario for the example (e.g., "Creating a standard user", "Creating an admin user").
- **Code Snippet**: Provide a `curl` command or a Python `requests` snippet demonstrating the call.
- **Clarification**: Ensure the examples cover different parameter combinations or edge cases if applicable.

## Output Format

The final output should be a single Markdown file. Use clear headers and code blocks.
