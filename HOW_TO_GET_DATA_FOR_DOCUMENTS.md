# 📊 COMPLETE GUIDE: Getting Data for Document Generation

## 🎯 Overview

Your Land Acquisition Management System generates documents (PDF reports) using **real-time data from the database**. Here's exactly how it works:

---

## 📄 1. FINANCIAL PROGRESS REPORT (The Document You Showed)

### **A. Data Source Table**
```sql
Table: compensation_payment_details

Key Fields:
├── final_compensation_amount          → Full Compensation (Rs.)
├── calculated_interest_amount         → Interest to be Paid (Rs.)
├── compensation_*_paid_amount (3)     → Payment Done (Rs.)
├── interest_*_paid_amount (3)         → Interest Paid (Rs.)
└── gazette_date                       → For interest calculation
```

---

### **B. Complete Data Flow Process**

#### **STEP 1: Data Entry (You/Staff Enter Data)**

**Where:** Compensation Payment Details page in your application

```javascript
// Frontend form submits to:
POST /api/compensation/plans/:plan_id/lots/:lot_id/owners/:owner_nic/payment-details

// Data saved to database:
{
  final_compensation_amount: 1000000,
  gazette_date: "2024-01-15",
  // Payment fields (optional at first)
  compensation_full_payment_date: null,
  compensation_full_payment_paid_amount: 0,
  // Interest fields (calculated later)
  calculated_interest_amount: 0,  // ← Initially 0
  interest_full_payment_paid_amount: 0
}
```

---

#### **STEP 2: Interest Calculation (Must Do This!)**

**Option A - Use Application Button:**
1. Navigate to compensation details
2. Click "Calculate Interest" button
3. System calls API automatically

**Option B - Use Script (Faster for bulk):**
```powershell
# Edit backend/fix_and_calculate_interest.js
# Set correct gazette date on line 6
node backend/fix_and_calculate_interest.js
```

**Option C - API Call:**
```javascript
POST /api/compensation/plans/:plan_id/lots/:lot_id/owners/:owner_nic/calculate-interest

Body: {
  "compensation_amount": 1000000,
  "valuation_date": "2024-01-15",
  "interest_rate": 0.07
}

// Response updates database:
// calculated_interest_amount = 122740 (example)
```

**What Happens:**
```javascript
// Backend calculates: (in progressService.js)
const interestAmount = calculateInterestAmount(
  compensationAmount,    // Rs. 1,000,000
  gazetteDate,          // "2024-01-15"
  today,                // "2025-10-15"
  0.07                  // 7% annual rate
);

// Formula: Principal × Rate × (Days / 365)
// Example: 1,000,000 × 0.07 × (640/365) = ~122,740

// Saves to database:
UPDATE compensation_payment_details 
SET calculated_interest_amount = 122740
WHERE plan_id = ? AND lot_id = ? AND owner_nic = ?
```

---

#### **STEP 3: Payment Recording (When Payments Made)**

**When you make an actual payment:**

```javascript
// Frontend updates:
PATCH /api/compensation/plans/:plan_id/lots/:lot_id/owners/:owner_nic/payment-details

Body: {
  // For compensation payment
  compensation_full_payment_date: "2025-10-01",
  compensation_full_payment_cheque_no: "123456",
  compensation_full_payment_paid_amount: 500000,
  
  // For interest payment (separate)
  interest_full_payment_date: "2025-10-01",
  interest_full_payment_paid_amount: 50000
}

// Database updates:
// Now payment_done will show Rs. 500,000
// And interest_paid will show Rs. 50,000
```

---

#### **STEP 4: Document Generation (Real-Time Query)**

**When user clicks "Generate Report":**

```javascript
// 1. Frontend calls API
const response = await api.get('/reports/financial-progress', {
  params: { plan_id: selectedPlan }
});

// 2. Backend executes THIS SQL (real-time, no cache):
SELECT 
  p.name as name_of_road,
  pl.plan_identifier as plan_name,
  l.lot_no as lot_number,
  
  -- These are fetched from database RIGHT NOW:
  COALESCE(cpd.final_compensation_amount, 0) as full_compensation,
  
  -- Payment Done = SUM of all compensation payments
  COALESCE(
    cpd.compensation_full_payment_paid_amount +
    cpd.compensation_part_payment_01_paid_amount +
    cpd.compensation_part_payment_02_paid_amount, 0
  ) as payment_done,
  
  -- Balance Due = Full Compensation - Payment Done
  (COALESCE(cpd.final_compensation_amount, 0) - 
   COALESCE(payment_sum, 0)) as balance_due,
  
  -- Interest to be Paid = Stored calculated value
  COALESCE(cpd.calculated_interest_amount, 0) as interest_7_percent,
  
  -- Interest Paid = SUM of all interest payments
  COALESCE(
    cpd.interest_full_payment_paid_amount +
    cpd.interest_part_payment_01_paid_amount +
    cpd.interest_part_payment_02_paid_amount, 0
  ) as interest_paid

FROM plans pl
JOIN projects p ON pl.project_id = p.id
JOIN lots l ON l.plan_id = pl.id
LEFT JOIN compensation_payment_details cpd 
  ON cpd.plan_id = pl.id AND cpd.lot_id = l.id
WHERE pl.id = ?
ORDER BY l.lot_no ASC;

// 3. Backend sends JSON to frontend
{
  "success": true,
  "data": {
    "financial_data": [
      {
        "name_of_road": "Elpitiya – Kahaduwa",
        "plan_name": "8039",
        "lot_number": "1",
        "full_compensation": 1000000,
        "payment_done": 0,
        "balance_due": 1000000,
        "interest_7_percent": 122740,  // ← From calculated_interest_amount
        "interest_paid": 0              // ← From sum of interest payments
      }
    ]
  }
}

// 4. Frontend displays in table
<tr>
  <td>Elpitiya – Kahaduwa</td>
  <td>8039</td>
  <td>Lot 1</td>
  <td>Rs. 1,000,000</td>
  <td>Rs. 0</td>
  <td>Rs. 1,000,000</td>
  <td>Rs. 122,740</td>  ← Interest to be Paid
  <td>Rs. 0</td>        ← Interest Paid
</tr>

// 5. Generate PDF with same data
autoTable(doc, {
  body: [
    ["Elpitiya – Kahaduwa", "8039", "Lot 1", 
     "1,000,000", "0", "1,000,000", "122,740", "0"]
  ]
});

// 6. User downloads PDF with real-time values
```

---

## 🎯 **KEY POINTS FOR REAL-TIME DATA**

### **✅ What Makes It Real-Time:**

1. **No Caching**
   - Every report request = Fresh database query
   - No stored/cached values used

2. **Direct Database Reads**
   - SQL executes on live database
   - `LEFT JOIN` ensures latest data

3. **Calculated Fields**
   - Balance Due = Calculated on-the-fly
   - Interest Paid = Summed from multiple fields
   - Payment Done = Summed from multiple fields

4. **Timestamp Independence**
   - No "generated_at" field used
   - Always pulls current state

---

## 📋 **DATA PREPARATION CHECKLIST**

Before generating documents with accurate data:

### **For Each Lot/Owner:**

- [ ] ✅ Enter `final_compensation_amount`
- [ ] ✅ Set `gazette_date` (required for interest)
- [ ] ✅ Calculate interest (runs formula, saves result)
- [ ] ✅ Record payments (when actually made)
- [ ] ✅ Generate report (pulls all current data)

---

## 🔧 **TROUBLESHOOTING: Why Values Show Zero**

### **If "Interest to be Paid" = Rs. 0:**

**Check:**
```sql
SELECT calculated_interest_amount, gazette_date 
FROM compensation_payment_details 
WHERE plan_id = ? AND lot_id = ?;
```

**Solutions:**
- If `calculated_interest_amount IS NULL` → Run interest calculation
- If `gazette_date IS NULL` → Set gazette date first, then calculate

### **If "Interest Paid" = Rs. 0:**

**Check:**
```sql
SELECT 
  interest_full_payment_paid_amount,
  interest_part_payment_01_paid_amount,
  interest_part_payment_02_paid_amount
FROM compensation_payment_details 
WHERE plan_id = ? AND lot_id = ?;
```

**Solution:**
- All NULL or 0? → No interest payments recorded yet (accurate)
- When payments made → Update these fields → Will show in report

---

## 📊 **OTHER DOCUMENT TYPES IN YOUR SYSTEM**

### **2. Physical Progress Report**

**API:** `GET /api/reports/physical-progress?plan_id={planId}`

**Data Fields:**
- Lot extent (hectares)
- Acquisition status
- Valuation complete status
- Payment completion status
- Overall progress percentage

### **3. Custom Reports (If Needed)**

**Pattern:**
```javascript
// Backend: Create controller in reportController.js
async function getCustomReport(req, res) {
  const query = `
    SELECT your_fields
    FROM your_tables
    WHERE conditions
  `;
  const [results] = await db.query(query, params);
  res.json({ success: true, data: results });
}

// Frontend: Call API and generate PDF
const response = await api.get('/reports/custom-report');
generatePDF(response.data.data);
```

---

## 🚀 **QUICK START: Generate Your First Complete Report**

### **Step 1: Prepare Data (One-Time Setup)**
```powershell
# Set gazette date and calculate interest for all records
node backend/fix_and_calculate_interest.js
```

### **Step 2: Generate Report (Anytime)**
1. Open your application
2. Navigate to Reports page
3. Select report type: "Financial Progress"
4. Select plan: "8039"
5. Click "Generate Report"
6. View on screen or download PDF

### **Step 3: Verify Real-Time**
```powershell
# Update a value in database
UPDATE compensation_payment_details 
SET calculated_interest_amount = 200000 
WHERE lot_id = 1 LIMIT 1;

# Regenerate report immediately
# You'll see Rs. 200,000 in the report!
# This proves it's real-time ✅
```

---

## 📝 **SUMMARY**

### **How Data Gets Into Documents:**

```
┌────────────────────────────────────────────────────────────┐
│  USER INPUT → DATABASE → SQL QUERY → API → FRONTEND → PDF │
└────────────────────────────────────────────────────────────┘
```

### **Real-Time Guarantee:**

1. ✅ No cache layers
2. ✅ Direct database queries
3. ✅ Fresh SQL execution per request
4. ✅ Current values always used
5. ✅ Same data in UI and PDF

### **Your Current Issue:**

- ❌ Interest not calculated → Shows Rs. 0 (accurate!)
- ✅ System working correctly
- 🔧 Solution: Run `fix_and_calculate_interest.js`

---

## 🎓 **Next Steps**

1. **Fix current zeros:** Run the interest calculation script
2. **Verify real-time:** Update a value, regenerate report
3. **Document process:** Train staff on data entry workflow
4. **Regular updates:** Recalculate interest periodically

**Your system is working perfectly for real-time document generation!** 🎉
