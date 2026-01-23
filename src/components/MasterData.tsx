import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DepartmentMaster } from './masters/DepartmentMaster';
import { FinancialYear } from './masters/FinancialYear';
import { GroupMaster } from './masters/GroupMaster';
import { RolePermissions } from './masters/RolePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Settings, Database } from 'lucide-react';

interface MasterDataProps {
  authToken?: string;
}

export function MasterData({ authToken }: MasterDataProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="size-5 text-blue-600" />
            Master Data Management
          </CardTitle>
          <CardDescription>
            Configure and manage system master data, budgets, and approval workflows
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="departments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white shadow-sm">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="financial-year">Financial Year</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="departments">
          <DepartmentMaster authToken={authToken} />
        </TabsContent>

        <TabsContent value="financial-year">
          <FinancialYear authToken={authToken} />
        </TabsContent>

        <TabsContent value="groups">
          <GroupMaster authToken={authToken} />
        </TabsContent>

        <TabsContent value="roles">
          <RolePermissions authToken={authToken} />
        </TabsContent>
      </Tabs>
    </div>
  );
}