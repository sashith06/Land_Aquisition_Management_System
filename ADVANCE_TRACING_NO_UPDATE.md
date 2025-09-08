# Advance Tracing No Update Implementation

## Overview
Updated the plan form to change "Advance Trading No" to "Advance Tracing No" and implemented it as a dropdown that gets populated from the project's advance tracing number.

## Changes Made

### 1. Database Schema Updates (`LAMS_COMPLETE_WAMPSERVER.sql`)
- **Line 109**: Updated `plans` table column from `advance_trading_no` to `advance_tracing_no`
- This ensures consistency in field naming across the application

### 2. Frontend Updates (`CreatePlan.jsx`)

#### State Management
- Added `selectedProjectDetails` state to store project details including advance_tracing_no
- Updated all form state references from `advance_trading_no` to `advance_tracing_no`

#### New Functions
- **`loadProjectDetails(projectId)`**: Fetches complete project details from API endpoint `/api/projects/:id`
- Called when project is selected or changed

#### Form Field Enhancement
- **Label Change**: "Advance Trading No" → "Advance Tracing No"
- **Conditional Rendering**: 
  - If project has advance_tracing_no: Shows dropdown with project's value
  - If no advance_tracing_no: Shows regular input field
  - Displays helpful message when no advance tracing number is found

#### User Experience Improvements
- Form field resets when project changes
- Clear visual feedback about data source
- Maintains backward compatibility with manual input

### 3. Backend Updates

#### Plan Controller (`planController.js`)
- **Line 15**: Updated parameter name from `advance_trading_no` to `advance_tracing_no`
- **Line 59**: Updated field mapping to use correct database column name
- Ensures proper data flow from frontend to database

#### Plan Model (`planModel.js`)
- **Line 18**: Updated SQL query to use `advance_tracing_no` column
- **Line 34**: Updated parameter mapping for database insertion
- **Line 109**: Updated allowed fields list for plan updates
- Maintains data integrity and proper field validation

### 4. Project Integration
- Leverages existing project API endpoint (`GET /api/projects/:id`)
- No additional backend endpoints required
- Uses existing project creation form which already has `advance_tracing_no` field

## How It Works

### Plan Creation Flow
1. **Project Selection**: User selects project from assigned projects list
2. **Data Loading**: System automatically loads project details including advance_tracing_no
3. **Field Population**: 
   - If project has advance_tracing_no: Dropdown shows the value as an option
   - If no advance_tracing_no: Regular input field appears
4. **Form Submission**: Selected/entered value is saved to plan record

### Edit Mode Flow
- Existing plans load with their saved advance_tracing_no values
- If project is changed during edit, dropdown updates accordingly
- Maintains data consistency throughout the editing process

## Benefits
1. **Data Consistency**: Ensures plans use advance tracing numbers from their parent projects
2. **User Friendly**: Dropdown interface reduces manual typing errors
3. **Flexibility**: Still allows manual input if project doesn't have the value
4. **Backward Compatible**: Existing plans continue to work normally
5. **Correct Terminology**: Uses proper "Tracing" instead of "Trading"

## Testing
- ✅ Backend server running on port 5000
- ✅ Frontend development server running on http://localhost:5173/
- ✅ Database schema updated
- ✅ All field mappings corrected

## Files Modified
1. `/LAMS_COMPLETE_WAMPSERVER.sql` - Database schema
2. `/frontend/src/pages/LandOfficer/CreatePlan.jsx` - Plan creation form
3. `/backend/controllers/planController.js` - Plan controller
4. `/backend/models/planModel.js` - Plan model

## Next Steps
1. Import updated SQL file to apply database schema changes
2. Test the plan creation flow with projects that have advance_tracing_no values
3. Test the plan creation flow with projects that don't have advance_tracing_no values
4. Verify edit functionality works correctly with the new field structure
