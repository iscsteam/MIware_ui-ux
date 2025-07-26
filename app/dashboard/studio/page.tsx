'use client';

import { useState } from 'react';
import { WorkflowEditor } from '@/components/workflow/workflow-editor';
import { History } from '@/components/workflow/history';
import { Sidebar } from '@/components/workflow/sidebar';
import { TopMenu } from '@/components/workflow/top-menu';
import { BottomPanel } from '@/components/workflow/bottom-panel';
import { WorkflowProvider } from '@/components/workflow/workflow-context';
import { ClientsPage } from '@/components/workflow/clients-page';

export default function StudioPage() {
  const [activeView, setActiveView] = useState('editor');

  const handleNavigateToClients = () => {
    setActiveView('clients');
  };

  const handleBackFromClients = () => {
    setActiveView('editor');
  };

  if (activeView === 'clients') {
    return (
      <WorkflowProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          <ClientsPage onBack={handleBackFromClients} />
        </div>
      </WorkflowProvider>
    );
  }

  return (
    <WorkflowProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopMenu
            activeView={activeView}
            setActiveView={setActiveView}
            onNavigateToClients={handleNavigateToClients}
          />
          {activeView === 'editor' ? (
            <>
              <WorkflowEditor />
              <BottomPanel />
            </>
          ) : (
            <History />
          )}
        </div>
      </div>
    </WorkflowProvider>
  );
}