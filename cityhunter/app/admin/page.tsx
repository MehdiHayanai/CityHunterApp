"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminTable from "./components/AdminTable";
import POIModal from "./components/POIModal";
import ConfirmationModal from "./components/ConfirmationModal";
import Toast from "../components/Toast";
import { DashboardItem, Walk } from "../interfaces/dashboard";
import { POIService } from "../services/poi";
import { useAuthStore } from "../../store/useAuthStore";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'monument' | 'event' | 'walk'>('monument');
  const [monuments, setMonuments] = useState<DashboardItem[]>([]);
  const [events, setEvents] = useState<DashboardItem[]>([]);
  const [walks, setWalks] = useState<Walk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Modal State
  const [showPOIModal, setShowPOIModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DashboardItem | Walk | null>(null);

  // Confirmation & Toast State
  const [confirmState, setConfirmState] = useState({
      isOpen: false,
      title: '',
      message: '',
      itemsToDelete: [] as any[], 
      isBulk: false
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{isOpen: boolean, message: string, type: 'success' | 'error' | 'info'}>({
      isOpen: false,
      message: '',
      type: 'success'
  });

  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuthStore();

  // Helper to show toasts
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
      setToast({ isOpen: true, message, type });
  }, []);

  // Auth Check Effect
  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        setIsAuthorized(true);
      }
    }
  }, [isAuthenticated, isAuthLoading, user, router]);

  const loadData = useCallback(async () => {
      setIsLoading(true);
      try {
          // Load Monuments
          const mData = await POIService.getPois('monument');
          setMonuments(mData.map((p: any) => ({
             id: p._id || p.id,
             name: p.name,
             type: p.tags?.[0] || 'Landmark',
             address: "Paris, France",
             lat: p.location?.coordinates?.[1] || 48.8566,
             lng: p.location?.coordinates?.[0] || 2.3522,
             img: p.images?.[0]?.url || "https://images.unsplash.com/photo-1502602898657-3e91760cbb34.jpg",
             desc: p.description,
             status: 'LIVE' 
          })));

          // Load Events
          const eData = await POIService.getPois('event');
          setEvents(eData.map((p: any) => ({
             id: p._id || p.id,
             name: p.name,
             type: 'Event',
             address: "Paris, France",
             lat: p.location?.coordinates?.[1] || 48.8566,
             lng: p.location?.coordinates?.[0] || 2.3522,
             img: p.images?.[0]?.url,
             desc: p.description,
             start_time: p.start_time,
             end_time: p.end_time,
             ticket_link: p.ticket_link,
             status: 'LIVE'
          })));

          // Load Walks
          const wData = await POIService.getWalks();
          setWalks(wData.map((w: any) => ({
              id: w._id || w.id,
              name: w.title || w.name,
              desc: w.description,
              difficulty: w.difficulty || "Medium",
              estTime: w.estimated_duration_minutes ? `${w.estimated_duration_minutes} min` : "90 min",
              stopIds: w.stops?.map((s: any) => s._id || s.id || s) || [],
              status: w.status,
              version: w.version
          })));

      } catch (err) {
          console.error("Failed to load admin data", err);
          showToast("Failed to load data", "error");
      } finally {
          setIsLoading(false);
      }
  }, [showToast]);

  useEffect(() => {
      if (isAuthorized) {
          loadData();
      }
  }, [isAuthorized, loadData]);

  // --- Handlers ---

  const handleCreate = () => {
      setSelectedItem(null);
      if (activeTab === 'walk') {
          router.push('/admin/walk-creator');
      } else {
          setShowPOIModal(true);
      }
  };

  const handleEdit = (item: any) => {
      setSelectedItem(item);
      if (activeTab === 'walk') {
          router.push(`/admin/walk-creator?id=${item.id}`);
      } else {
          setShowPOIModal(true);
      }
  };

  // 1. Initial Delete Click (Single)
  const handleDeleteClick = (item: any) => {
      setConfirmState({
          isOpen: true,
          title: `Delete ${activeTab}?`,
          message: `Are you sure you want to delete "${item.name}"?`,
          itemsToDelete: [item],
          isBulk: false
      });
  };

  // 2. Initial Bulk Delete Click
  const handleBulkDeleteClick = (items: any[]) => {
      setConfirmState({
          isOpen: true,
          title: `Delete ${items.length} ${activeTab}s?`,
          message: `Are you sure you want to delete these ${items.length} items? This action cannot be undone.`,
          itemsToDelete: items,
          isBulk: true
      });
  };

  // 3. Execute Delete (Confirmed)
  const executeDelete = async () => {
      setIsDeleting(true);
      try {
          const items = confirmState.itemsToDelete;
          
          await Promise.all(items.map(async (item) => {
              if (activeTab === 'walk') {
                  await POIService.deleteWalk(String(item.id));
              } else {
                  await POIService.deletePOI(String(item.id));
              }
          }));
          
          await loadData();
          showToast(`Successfully deleted ${items.length} item(s)`);
          setConfirmState(prev => ({ ...prev, isOpen: false }));
      } catch (e: any) {
          console.error("Delete failed:", e);
          const msg = e instanceof Error ? e.message : "Failed to delete item(s)";
          showToast(msg, "error");
      } finally {
          setIsDeleting(false);
      }
  };

  const handleSavePOI = async (data: any) => {
      try {
          if (data.id) {
              await POIService.updatePOI(data.id, data);
              showToast("POI updated successfully");
          } else {
              if (activeTab === 'monument') await POIService.createMonument(data);
              else await POIService.createEvent(data);
              showToast("POI created successfully");
          }
          await loadData();
      } catch (e: any) {
          console.error("Save POI failed:", e);
          const msg = e instanceof Error ? e.message : "Failed to save POI";
          showToast(msg, "error");
      }
  };

  const handleSaveWalk = async (data: any) => {
      try {
          let walkId = data.id;
          if (walkId) {
              // Check if the source walk was published
              const originalWalk = walks.find(w => w.id === walkId);
              if (originalWalk?.status === 'PUBLISHED') {
                  showToast("Published walk detected. Creating new version...", "info");
                  const newVersion = await POIService.createNewVersion(walkId);
                  walkId = newVersion._id || newVersion.id;
              }
              await POIService.updateWalk(walkId, data);
              showToast("Walk updated successfully");
          } else {
              await POIService.createWalk(data);
              showToast("Walk created successfully");
          }
          await loadData();
      } catch (e: any) {
          console.error("Save Walk failed:", e);
          const msg = e instanceof Error ? e.message : "Failed to save Walk";
          showToast(msg, "error");
      }
  };

  const allPOIs = [...monuments, ...events];

  if (isAuthLoading || !isAuthorized) {
      return (
          <div className="flex h-screen items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      {/* Tabs & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 bg-surface p-1 rounded-xl shadow-lg border border-divider/10">
            {['monument', 'event', 'walk'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                        ${activeTab === tab 
                            ? 'bg-accent text-black shadow-md' 
                            : 'text-secondary hover:text-primary hover:bg-white/5'}
                    `}
                >
                    {tab}s
                </button>
            ))}
        </div>
        
        <button onClick={handleCreate} className="bg-accent text-black px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-lg hover:shadow-accent/20 flex items-center gap-2">
            <i className="fa-solid fa-plus"></i>
            Create New {activeTab}
        </button>
      </div>

      {/* Content Table */}
      <AdminTable 
        type={activeTab} 
        data={activeTab === 'monument' ? monuments : activeTab === 'event' ? events : walks}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onBulkDelete={handleBulkDeleteClick}
      />

      {/* Modals */}
      {showPOIModal && (
        <POIModal 
            type={activeTab as 'monument' | 'event'}
            initialData={selectedItem as DashboardItem} 
            onSave={handleSavePOI} 
            onClose={() => setShowPOIModal(false)} 
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          message={confirmState.message}
          onConfirm={executeDelete}
          onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
          isLoading={isDeleting}
          confirmText="Delete"
          variant="danger"
      />

      {/* Toast */}
      {toast.isOpen && (
          <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => setToast(prev => ({ ...prev, isOpen: false }))} 
          />
      )}
    </div>
  );
}
