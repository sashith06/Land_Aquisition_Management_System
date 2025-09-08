import PlansLotsView from '../../components/PlansLotsView';
import { getUserRole } from '../../components/ProtectedRoute';

const CEPlansLots = () => {
  const userRole = getUserRole();

  return (
    <div className="p-6">
      <PlansLotsView userRole={userRole || 'CE'} />
    </div>
  );
};

export default CEPlansLots;
