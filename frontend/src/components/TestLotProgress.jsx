import React, { useEffect, useState } from 'react';

const TestLotProgress = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testAPI = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }

        const response = await fetch('http://localhost:5000/api/stats/project-hierarchy', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const result = await response.json();
        console.log('=== REAL API RESPONSE ===');
        console.log(JSON.stringify(result, null, 2));
        
        if (result.success && result.data.charts && result.data.charts.lots) {
          const lots = result.data.charts.lots;
          console.log('=== PROCESSING LOTS ===');
          
          const stepCounts = {
            'Owner Details': 0,
            'Land Details': 0,
            'Valuation': 0,
            'Compensation': 0,
            'Completed': 0
          };
          
          lots.forEach(lot => {
            let step = 'Owner Details';
            
            if (lot.last_completed_section) {
              if (lot.last_completed_section === 'Compensation' && lot.overall_percent >= 100) {
                step = 'Completed';
              } else if (lot.last_completed_section === 'Compensation') {
                step = 'Compensation';
              } else if (lot.last_completed_section === 'Valuation') {
                step = 'Compensation';
              } else if (lot.last_completed_section === 'Land Details') {
                step = 'Valuation';
              } else if (lot.last_completed_section === 'Owner Details') {
                step = 'Land Details';
              }
            } else {
              if (lot.overall_percent >= 100) {
                step = 'Completed';
              } else if (lot.overall_percent >= 75) {
                step = 'Compensation';
              } else if (lot.overall_percent >= 50) {
                step = 'Valuation';
              } else if (lot.overall_percent >= 25) {
                step = 'Land Details';
              }
            }
            
            stepCounts[step]++;
            console.log(`Lot ${lot.lot_no} (ID:${lot.id}): ${lot.overall_percent}%, "${lot.last_completed_section}" → ${step}`);
          });
          
          console.log('Final step counts:', stepCounts);
          setData({ lots, stepCounts });
        }
        
      } catch (error) {
        console.error('API Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    testAPI();
  }, []);

  if (loading) return <div>Loading test...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Test Lot Progress API</h2>
      {data ? (
        <>
          <h3>Step Counts:</h3>
          <pre>{JSON.stringify(data.stepCounts, null, 2)}</pre>
          <h3>Lot Details:</h3>
          {data.lots.map(lot => {
            let step = 'Owner Details';
            if (lot.last_completed_section) {
              if (lot.last_completed_section === 'Compensation' && lot.overall_percent >= 100) {
                step = 'Completed';
              } else if (lot.last_completed_section === 'Compensation') {
                step = 'Compensation';
              } else if (lot.last_completed_section === 'Valuation') {
                step = 'Compensation';
              } else if (lot.last_completed_section === 'Land Details') {
                step = 'Valuation';
              } else if (lot.last_completed_section === 'Owner Details') {
                step = 'Land Details';
              }
            }
            return (
              <div key={lot.id} style={{ marginBottom: '10px' }}>
                Lot {lot.lot_no} (ID:{lot.id}): {lot.overall_percent}%, "{lot.last_completed_section}" → <strong>{step}</strong>
              </div>
            );
          })}
        </>
      ) : (
        <div>No data available</div>
      )}
    </div>
  );
};

export default TestLotProgress;