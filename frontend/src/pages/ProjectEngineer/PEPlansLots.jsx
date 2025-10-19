import PlansLotsView from '../../components/PlansLotsView';
import { getUserRole } from '../../components/ProtectedRoute';
import Breadcrumb from '../../components/Breadcrumb';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';

const PEPlansLots = () => {
  const userRole = getUserRole();
  const { generateBreadcrumbs } = useBreadcrumbs();

  return (
    <div className="p-6">
      <div className="mb-6">
        <Breadcrumb items={generateBreadcrumbs()} />
      </div>
      <PlansLotsView userRole={userRole || 'PE'} />
    </div>
  );
};

export default PEPlansLots;
