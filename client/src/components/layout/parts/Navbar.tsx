import React from 'react';
import { Building } from 'lucide-react';
import { useOrg } from '../../../contexts/OrgContext';
import CustomSelect from '../../ui/CustomSelect';
import NavbarBrand from './NavbarBrand';
import NavbarContent from './NavbarContent';
import NavbarActions from './NavbarActions';

const Navbar: React.FC = () => {
  const { currentOrg, organizations, setOrganization } = useOrg();

  return (
    <div id="navbar" className="h-14 flex items-center bg-panel-bg transition-colors">
      <NavbarBrand />
      <NavbarContent>
        <div className="flex items-center gap-2 w-64 h-8">
          <CustomSelect
            options={organizations.map(org => ({
              id: org.id,
              label: org.name,
              description: `${org.slug}.devnfw.io`,
              icon: <Building size={10} />
            }))}
            value={currentOrg?.id || ''}
            onChange={(id) => setOrganization(id)}
            placeholder="SELECT_ORG"
            className="h-full"
          />
        </div>
      </NavbarContent>
      <NavbarActions  />
    </div>
  );
};

export default Navbar;