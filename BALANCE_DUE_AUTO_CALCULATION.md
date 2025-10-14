# Balance Due Auto-Calculation Enhancement

## Enhancement Description
Added real-time auto-calculation for the "Balance Due" field in the compensation form. The balance due now updates instantly as the user enters the final compensation amount or payment details, without needing to save first.

## Changes Made

### 1. Added New Function: `getEditingOwnerBalanceDue()`
**Location:** `frontend/src/components/CompensationDetailsTab.jsx` (After line 800)

This new function calculates the balance due in real-time from the editing form state:

```javascript
const getEditingOwnerBalanceDue = () => {
  if (!editingOwner) return 0;
  
  const finalAmount = parseFloat(editingOwner.compensation?.finalCompensationAmount) || 0;
  
  // Get payment details for this owner
  const actualLotId = selectedLot.backend_id || selectedLot.id;
  const key = `${currentPlanId}_${actualLotId}_${editingOwner.nic}`;
  const data = paymentDetails[key];
  
  let totalPaid = 0;
  if (data && data.compensationPayment) {
    if (data.compensationPayment.fullPayment?.paidAmount) {
      totalPaid += parseFloat(data.compensationPayment.fullPayment.paidAmount) || 0;
    }
    if (data.compensationPayment.partPayment01?.paidAmount) {
      totalPaid += parseFloat(data.compensationPayment.partPayment01.paidAmount) || 0;
    }
    if (data.compensationPayment.partPayment02?.paidAmount) {
      totalPaid += parseFloat(data.compensationPayment.partPayment02.paidAmount) || 0;
    }
  }
  
  return Math.max(0, finalAmount - totalPaid);
};
```

**Formula:**
```
Balance Due = Final Compensation Amount - Total Payments Made

Where Total Payments = Full Payment + Part Payment 01 + Part Payment 02
```

### 2. Updated Balance Due Display
**Location:** `frontend/src/components/CompensationDetailsTab.jsx` (Line ~1275)

Changed from using `getOwnerBalanceDue(editingOwner)` to `getEditingOwnerBalanceDue()`:

**Before:**
```javascript
<div className={`text-lg font-semibold ${getOwnerBalanceDue(editingOwner) === 0 ? 'text-green-600' : 'text-red-600'}`}>
  {formatCurrency(getOwnerBalanceDue(editingOwner))}
</div>
```

**After:**
```javascript
<div className={`text-lg font-semibold ${getEditingOwnerBalanceDue() === 0 ? 'text-green-600' : 'text-red-600'}`}>
  {formatCurrency(getEditingOwnerBalanceDue())}
</div>
{getEditingOwnerBalanceDue() > 0 && (
  <div className="text-xs text-gray-500 mt-1">
    Automatically updates as you enter payment details below
  </div>
)}
```

## How It Works

### Real-Time Calculation Flow:

1. **User enters Final Compensation Amount** (e.g., Rs. 100,000)
   - Balance Due instantly shows: **Rs. 100,000**
   - Interest Due calculates: **Rs. X,XXX** (based on gazette date)

2. **User enters Full Payment** (e.g., Rs. 100,000)
   - Balance Due instantly updates to: **Rs. 0** (turns green)
   - No need to save to see the calculation

3. **User enters Partial Payments** (e.g., Part 01: Rs. 50,000)
   - Balance Due instantly updates to: **Rs. 50,000** (remains red)
   - Shows helper text: "Automatically updates as you enter payment details below"

4. **User enters remaining payment** (Part 02: Rs. 50,000)
   - Balance Due instantly updates to: **Rs. 0** (turns green)
   - Helper text disappears

## Visual Feedback

### Color Coding:
- **Red Text** = Balance Due > 0 (Payment pending)
- **Green Text** = Balance Due = 0 (Fully paid)

### Helper Text:
- Shows small gray text when balance > 0
- Informs user that the field updates automatically
- Disappears when balance is cleared

## User Experience Improvements

### Before Enhancement:
❌ User had to:
1. Enter final compensation amount
2. Save the form
3. Reopen to see balance due
4. Enter payment details
5. Save again to see updated balance

### After Enhancement:
✅ User can now:
1. Enter final compensation amount
2. See balance due immediately (same as compensation amount)
3. Enter payment details
4. Watch balance decrease in real-time
5. Save once when everything is correct

## Example Scenarios

### Scenario 1: New Compensation Entry
1. Enter Final Amount: **Rs. 100,000**
   - Balance Due: **Rs. 100,000** (Red)
   - Interest Due: **Rs. 7,000** (Calculated)

### Scenario 2: Full Payment
1. Final Amount: **Rs. 100,000**
2. Full Payment: **Rs. 100,000**
   - Balance Due: **Rs. 0** (Green) ✅

### Scenario 3: Partial Payments
1. Final Amount: **Rs. 100,000**
2. Part Payment 01: **Rs. 40,000**
   - Balance Due: **Rs. 60,000** (Red)
3. Part Payment 02: **Rs. 60,000**
   - Balance Due: **Rs. 0** (Green) ✅

### Scenario 4: Mixed Payments
1. Final Amount: **Rs. 100,000**
2. Full Payment: **Rs. 50,000**
3. Part Payment 01: **Rs. 30,000**
   - Balance Due: **Rs. 20,000** (Red)
4. Part Payment 02: **Rs. 20,000**
   - Balance Due: **Rs. 0** (Green) ✅

## Technical Details

### Dependencies:
- Uses React state (`editingOwner`, `paymentDetails`)
- Updates on every render when state changes
- No API calls needed for calculation

### Performance:
- Calculation is instant (client-side)
- No network latency
- Smooth user experience

## Testing Checklist

- [x] Enter compensation amount - balance updates immediately
- [x] Enter full payment - balance becomes zero
- [x] Enter partial payments - balance decreases correctly
- [x] Mix of payment types - calculation is accurate
- [x] Zero compensation - balance shows zero
- [x] Color changes (red to green) when balance cleared
- [x] Helper text appears/disappears correctly

## Files Modified
- `frontend/src/components/CompensationDetailsTab.jsx`

## Date Implemented
October 14, 2025

## Related Features
- Real-time interest calculation (`getEditingOwnerInterest()`)
- Compensation progress tracking
- Payment completion status
