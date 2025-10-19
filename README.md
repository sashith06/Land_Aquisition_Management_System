# Land Acquisition Management System (LAMS)

## Overview

The Land Acquisition Management System (LAMS) is a comprehensive web-based platform designed to streamline and manage the process of land acquisition for public infrastructure and development projects. This system facilitates the efficient management of land acquisition procedures, compensation processing, landowner communication, and project monitoring from initial planning to completion.

## Purpose

LAMS addresses the complex challenges associated with land acquisition by providing a centralized platform that connects government officials, land officers, valuers, and landowners. The system aims to improve transparency, reduce processing time, and enhance communication throughout the acquisition process.

## Key Features

### Project Management
- Create and manage multiple acquisition projects
- Track project progress through various stages
- Generate project reports and statistics

### Land Management
- Register and document land parcels (lots)
- Upload and store land-related documentation
- Track land status throughout the acquisition process

### Landowner Management
- Register landowner information
- Verify ownership details
- Maintain communication history

### Valuation and Compensation
- Record land valuations based on established criteria
- Calculate compensation amounts
- **Automatic interest calculation** (7% p.a. from Section 38 Gazette Date) ⚡
- **Store calculated interest** in database for consistency 💾
- Track compensation payment status
- Generate payment schedules

> **Note**: The system automatically calculates and saves interest amounts when final compensation is entered. See [Calculated Interest Documentation](./IMPLEMENTATION_SUMMARY.md) for details.

### Communication
- Notification system for stakeholders
- Messaging platform between officials and landowners
- Inquiry management for addressing concerns and questions

### User Management
- Role-based access control (Land Officers, Valuers, Administrators)
- Authentication and authorization
- User activity logging

### Reporting
- Generate comprehensive reports on acquisition progress
- Export data for external analysis
- Statistical dashboards for progress monitoring

## Technical Architecture

### Frontend
- Built with React.js
- Styled with Tailwind CSS
- Responsive design for multiple device support
- Vite for fast development and build process

### Backend
- Node.js with Express framework
- RESTful API architecture
- JWT-based authentication
- Email notification services

### Database
- MySQL database for structured data storage
- SQL-based queries for complex data retrieval

## Installation

### Prerequisites
- Node.js (v14.x or higher)
- MySQL (v8.x or higher)
- WAMP/XAMPP server (for local development)

### Database Setup
1. Install MySQL server
2. Import the database schema from `LAMS_COMPLETE_WAMPSERVER.sql`

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Configure database connection in `config/db.js`
4. Start the server:
   ```
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## Usage

1. Access the system through the browser (default: http://localhost:5173)
2. Log in with appropriate credentials based on your role
3. Navigate through the dashboard to access relevant features

## User Roles

### Administrator
- System configuration
- User management
- Access to all features

### Land Officer
- Project management
- Land registration
- Progress tracking
- Report generation

### Valuer
- Land valuation
- Compensation calculation
- Valuation reports

### Landowner
- View acquisition status
- Access compensation details
- Submit inquiries
- Upload documents

## Recent Updates

### October 14, 2025 - Calculated Interest Amount
✅ **Implemented automatic interest calculation and storage**
- System now calculates interest when final compensation is entered
- Interest amount is saved to `calculated_interest_amount` database column
- Stored interest is used for consistent completion tracking
- Formula: `(Principal × 0.07 × Days) / 365`

**Documentation:**
- [📋 Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [📘 User Guide](./CALCULATED_INTEREST_USER_GUIDE.md)
- [🔄 Data Flow Diagram](./CALCULATED_INTEREST_FLOW_DIAGRAM.md)
- [🎯 Quick Reference](./QUICK_REFERENCE.md)

## Contributing

Please read the contribution guidelines before submitting pull requests to the project.

## License

This project is proprietary software developed for specific government and institutional use.

## Contact

For more information, please contact the system administrator.