import React from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Database, Palette } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';

export default function Settings() {
  return (
    <PageContainer title="Settings" subtitle="Platform configuration and user preferences.">
      <div className="max-w-3xl space-y-4">
        {[{ icon: User, title: 'Profile', description: 'Manage your account details and role assignments.' }, { icon: Bell, title: 'Notifications', description: 'Configure alert thresholds and notification preferences.' }, { icon: Shield, title: 'Access & Permissions', description: 'Manage user roles and data access levels.' }, { icon: Database, title: 'Data Sources', description: 'Configure data pipeline connections and sync schedules.' }, { icon: Palette, title: 'Appearance', description: 'Customize dashboard layout and display preferences.' }].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center"><Icon size={18} className="text-navy-600" /></div>
                <div><h3 className="text-sm font-semibold text-navy-800">{item.title}</h3><p className="text-xs text-navy-500">{item.description}</p></div>
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
