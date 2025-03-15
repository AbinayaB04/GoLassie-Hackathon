# GoLassie-Hackathon

# Dental Insurance Payer Processing System
This project implements a robust system to process, deduplicate, and normalize payer information in the dental insurance industry. Designed to handle variations in payer data across multiple sources, the system features a scalable architecture for file uploads, fuzzy matching, data mapping, and standardization.

# Features
### Payer Data Mapping:

Maps raw payer details (from ERA payments or other sources) to canonical payers.

Deduplicates records based on payer numbers, EINs, and semantic matching.

### Semantic Matching:

Uses Fuse.js to handle slight variations in payer names and ensure accurate matches.

Pretty Name Standardization:

Supports assigning "pretty names" for standardized payer representation in claims and UI.

### File Upload & Processing:

Enables bulk uploads of payer data via Excel files.

Normalized Database Design:

A relational schema organizes payer groups, payers, and payer details to ensure data integrity and scalability.

Architecture
## 1. Database Schema
payer_groups:

Represents parent companies or umbrella organizations.

Examples: Delta Dental (group for all regional Delta Dental entities).

payers:

Represents specific insurance payers belonging to groups.

Examples: Delta Dental of Arizona, Delta Dental of California.

payer_details:

Captures variations in how payers are identified in raw data, such as payer numbers, EINs, and names from different sources.

### Schema Design:
sql
```
CREATE TABLE payer_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE payers (
    id SERIAL PRIMARY KEY,
    group_id INT REFERENCES payer_groups(id),
    name VARCHAR(255) NOT NULL,
    payer_number VARCHAR(50) UNIQUE,
    pretty_name VARCHAR(255)
);

CREATE TABLE payer_details (
    id SERIAL PRIMARY KEY,
    payer_id INT REFERENCES payers(id),
    name VARCHAR(255) NOT NULL,
    payer_number VARCHAR(50),
    ein VARCHAR(50),
    source VARCHAR(255),
    UNIQUE (payer_number, ein, source)
);
```
## 2. Backend
### Technology Stack:

Node.js

Express.js

PostgreSQL

Fuse.js (for fuzzy matching)

Multer and xlsx (for file upload and processing)

Key Endpoints:
### File Upload:

POST /api/payers/upload

Uploads an Excel file and maps payer details to canonical payers.

### Fetch Payers:

GET /api/payers

Retrieves all canonical payers.

## 3. Mapping Algorithm
The mapping algorithm ensures payer details are deduplicated and linked appropriately to canonical payers. It uses exact matching (for payer numbers/EINs) and fuzzy matching (for name variations).

Mapping Logic:
Exact Matching:

Matches raw payer data based on payer number 

Semantic Matching:

Uses Fuse.js to identify payers with similar names.

New Record Handling:

Inserts new payer details if no match exists.
