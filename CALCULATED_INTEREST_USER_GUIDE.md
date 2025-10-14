# Calculated Interest - User Guide

## What is Calculated Interest?

When you enter a **Final Compensation Amount** for a landowner, the system automatically calculates the interest that should be paid based on:
- The compensation amount
- The Section 38 gazette date
- 7% annual interest rate
- Number of days from gazette date to today

This calculated interest amount is **saved to the database** and used for tracking payment completion.

## Where to Find It

### 1. Compensation Details Form
When editing compensation for an owner:
- Enter the **Final Compensation Amount**
- The **Calculated Interest** is displayed automatically
- This interest amount is saved when you click "Save"

### 2. Payment Progress Tracking
The system uses the calculated interest to determine if interest payments are complete:
- **Complete**: Total interest paid equals the calculated interest amount
- **Incomplete**: More interest payments needed

### 3. Console Logs (For Debugging)
Check browser console for:
```
💰 Calculated Interest Amounts from API: [...]
💰 Using stored calculated interest for [owner name]: [amount]
```

## How It Works

### Step 1: Enter Compensation
```
Final Compensation Amount: 1,000,000.00 LKR
↓
System calculates interest automatically
↓
Calculated Interest: 70,000.00 LKR (example)
```

### Step 2: Save to Database
```
Click "Save Compensation Details"
↓
Both amounts saved to database:
- final_compensation_amount: 1,000,000.00
- calculated_interest_amount: 70,000.00
```

### Step 3: Track Payments
```
Enter interest payments:
- Interest Full Payment: 70,000.00 LKR
↓
System compares:
- Calculated Interest: 70,000.00 ✓
- Total Paid Interest: 70,000.00 ✓
- Status: Complete ✓
```

## Important Notes

1. **Automatic Calculation**: Interest is calculated automatically when you enter the final compensation amount

2. **Stored Value**: The calculated interest is saved to the database and used consistently throughout the system

3. **Completion Tracking**: The system uses the stored calculated interest to determine if interest payments are complete

4. **Historical Accuracy**: Even if interest rates or calculation methods change in the future, the original calculated interest is preserved

5. **Real-time Updates**: When editing, the calculated interest updates in real-time as you change the compensation amount

## Interest Calculation Formula

```
Interest = (Principal × Annual Rate × Days) / 365

Where:
- Principal = Final Compensation Amount
- Annual Rate = 0.07 (7%)
- Days = Days from Section 38 Gazette Date to Today
```

## Example Calculation

```
Final Compensation: 1,000,000 LKR
Gazette Date: 2024-01-01
Current Date: 2025-10-14
Days: 652 days

Interest = (1,000,000 × 0.07 × 652) / 365
Interest = 125,041.10 LKR
```

## Troubleshooting

### Interest Not Calculating?
Check:
- Is the Final Compensation Amount entered?
- Is the Section 38 Gazette Date set in the plan?
- Check browser console for errors

### Interest Amount Seems Wrong?
Verify:
- Section 38 Gazette Date is correct
- Final Compensation Amount is correct
- Number of days is as expected

### Stored Interest vs. Live Calculation
- The system prefers the **stored calculated interest** from the database
- If no stored value exists, it calculates dynamically
- Check console logs to see which method is being used

## For Developers

### Console Log Messages

**When Loading Data:**
```
💰 Calculated Interest Amounts from API: [{nic: "123456789V", calculatedInterest: 70000}]
```

**When Using Stored Interest:**
```
💰 Using stored calculated interest for John Doe: 70000
```

**When Saving:**
```
💰 CALCULATED INTEREST BEING SAVED: 70000
📤 Sending response with calculated interest amounts: [{nic: "123456789V", calculatedInterest: 70000}]
```

### Database Field
```sql
calculated_interest_amount DECIMAL(15,2) DEFAULT 0.00
```

Located in table: `compensation_payment_details`

---

**Last Updated**: October 14, 2025
