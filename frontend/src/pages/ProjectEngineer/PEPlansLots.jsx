import PlansLotsView from '../../components/PlansLotsView';
import { getUserRole } from '../../components/ProtectedRoute';

const PEPlansLots = () => {
  const userRole = getUserRole();

  return (
    <div className="p-6">
      <PlansLotsView userRole={userRole || 'PE'} />
    </div>
  );
};

export default PEPlansLots;
