import PlansLotsView from '../../components/PlansLotsView';
import { getUserRole } from '../../components/ProtectedRoute';
import Breadcrumb from '../../components/Breadcrumb';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';

const FOPlansLots = () => {
  const userRole = getUserRole();
  const { generateBreadcrumbs } = useBreadcrumbs();

  return (
    <div className="p-6">
      <div className="mb-6">
        <Breadcrumb items={generateBreadcrumbs()} />
      </div>
      <PlansLotsView userRole={userRole || 'FO'} />
    </div>
  );
};

export default FOPlansLots;
