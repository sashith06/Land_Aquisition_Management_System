import PlansLotsView from '../../components/PlansLotsView';
import { getUserRole } from '../../components/ProtectedRoute';

const FOPlansLots = () => {
  const userRole = getUserRole();

  return (
    <div className="p-6">
      <PlansLotsView userRole={userRole || 'FO'} />
    </div>
  );
};

export default FOPlansLots;
