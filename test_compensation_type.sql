-- ================================================
-- TEST: Compensation Type Enum Values
-- ================================================

-- Test inserting projects with different compensation types
INSERT INTO projects (
  name,
  description,
  initial_estimated_cost,
  initial_extent_ha,
  initial_extent_perch,
  compensation_type,
  notes,
  created_by,
  status
) VALUES
('Test Project - Regulation', 'Testing regulation compensation type', 1000000.00, 50.00, 19750.00, 'regulation', 'Test notes for regulation', 2, 'pending'),
('Test Project - LARC', 'Testing LARC compensation type', 2000000.00, 75.00, 29625.00, 'larc/super larc', 'Test notes for LARC', 2, 'pending'),
('Test Project - Special Committee', 'Testing special committee compensation type', 3000000.00, 100.00, 39537.00, 'special Committee Decision', 'Test notes for special committee', 2, 'pending');

-- Verify the data was inserted correctly
SELECT
  id,
  name,
  compensation_type,
  status
FROM projects
WHERE name LIKE 'Test Project%'
ORDER BY id;

-- Test updating compensation type
UPDATE projects
SET compensation_type = 'special Committee Decision'
WHERE name = 'Test Project - Regulation';

-- Verify the update worked
SELECT
  id,
  name,
  compensation_type
FROM projects
WHERE name = 'Test Project - Regulation';

-- Clean up test data
DELETE FROM projects WHERE name LIKE 'Test Project%';

-- ================================================
-- END OF TEST
-- ================================================
