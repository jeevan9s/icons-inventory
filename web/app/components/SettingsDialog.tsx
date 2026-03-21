"use client";

import Modal from "./Modal";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Package, Plus, Trash2, Pencil, Check, X, Save } from "lucide-react";
import { useGetRows, useUpdateRow } from "@/services/lib/hooks/useDatabase";
import { useUser } from "@/services/lib/hooks/useAuth";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type Role = "Admin" | "Dev" | "Operator";
type Section = "users" | "equipment";

const ROLES: Role[] = ["Admin", "Dev", "Operator"];

export default function SettingsDialog({ isOpen, onClose }: Props) {
  const { user } = useUser();
  const isAdmin = user?.role === "Admin" || user?.role === "Dev";
  const [section, setSection] = useState<Section>("equipment");

  const { data: profiles = [] } = useGetRows("Profiles");
  const { data: stockRows = [] } = useGetRows("Stock");
  const updateProfile = useUpdateRow("Profiles");
  const updateStock = useUpdateRow("Stock");

  const [customTypes, setCustomTypes] = useState<string[]>([]);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Load custom types from current admin user's profile settings
  useEffect(() => {
    if (user?.id && profiles.length > 0) {
      const currentProfile = profiles.find((p: any) => p.id === user.id);
      if (currentProfile?.settings?.custom_equipment_types) {
        setCustomTypes(currentProfile.settings.custom_equipment_types);
      }
      setSettingsLoaded(true);
    }
  }, [user?.id, profiles]);

  const [pendingRoles, setPendingRoles] = useState<Record<string, Role>>({});
  const [newType, setNewType] = useState("");
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [isSavingRoles, setIsSavingRoles] = useState(false);

  const stockDerivedTypes = Array.from(
    new Set(
      (stockRows as any[])
        .map((r) => r.item_properties?.equipment_type)
        .filter(Boolean)
    )
  ) as string[];

  const equipmentTypes = Array.from(
    new Set([...stockDerivedTypes, ...customTypes])
  ) as string[];

  const handleRoleChange = (profileId: string, newRole: Role) => {
    setPendingRoles((prev) => ({ ...prev, [profileId]: newRole }));
  };

  const handleSaveRoles = async () => {
    setIsSavingRoles(true);
    try {
      await Promise.all(
        Object.entries(pendingRoles).map(([profileId, role]) =>
          updateProfile.mutateAsync({ id: profileId, data: { role } })
        )
      );
      setPendingRoles({});
      toast.success("Roles saved successfully");
    } catch {
      toast.error("Failed to save roles");
    } finally {
      setIsSavingRoles(false);
    }
  };

  const handleAddType = async () => {
    const trimmed = newType.trim().toLowerCase();
    if (!trimmed) return;
    if (equipmentTypes.includes(trimmed)) {
      toast.error("Type already exists");
      return;
    }
    const updated = [...customTypes, trimmed];
    setCustomTypes(updated);
    setNewType("");

    // Save to database
    if (user?.id) {
      const currentProfile = profiles.find((p: any) => p.id === user.id);
      const currentSettings = currentProfile?.settings || {};
      await updateProfile.mutateAsync({
        id: user.id,
        data: {
          settings: {
            ...currentSettings,
            custom_equipment_types: updated,
          },
        },
      });
    }

    toast.success(`"${trimmed}" added`);
  };

  const handleDeleteType = async (type: string) => {
    const isCustom = customTypes.includes(type);
    if (isCustom) {
      const updated = customTypes.filter((t) => t !== type);
      setCustomTypes(updated);

      // Save to database
      if (user?.id) {
        const currentProfile = profiles.find((p: any) => p.id === user.id);
        const currentSettings = currentProfile?.settings || {};
        await updateProfile.mutateAsync({
          id: user.id,
          data: {
            settings: {
              ...currentSettings,
              custom_equipment_types: updated,
            },
          },
        });
      }

      toast.success(`"${type}" removed`);
    } else {
      toast.error("Cannot delete a type assigned to inventory items");
    }
  };

  const handleRenameType = async (oldType: string) => {
    const trimmed = editingValue.trim().toLowerCase();
    if (!trimmed || trimmed === oldType) {
      setEditingType(null);
      return;
    }

    const affected = (stockRows as any[]).filter(
      (r) => r.item_properties?.equipment_type === oldType
    );

    try {
      // Update each affected item individually to handle errors gracefully
      const updatePromises = affected.map((row) =>
        updateStock.mutateAsync({
          id: row.id,
          data: {
            item_properties: { 
              ...Object.fromEntries(
                Object.entries(row.item_properties || {}).filter(([key]) => key !== 'name')
              ), 
              equipment_type: trimmed 
            },
          },
        }).catch((error) => {
          console.error(`Failed to update item ${row.id}:`, error);
          // Continue with other updates even if one fails
          return null;
        })
      );

      await Promise.all(updatePromises);

      if (customTypes.includes(oldType)) {
        const updated = customTypes.map((t) => (t === oldType ? trimmed : t));
        setCustomTypes(updated);

        // Save to database
        if (user?.id) {
          const currentProfile = profiles.find((p: any) => p.id === user.id);
          const currentSettings = currentProfile?.settings || {};
          await updateProfile.mutateAsync({
            id: user.id,
            data: {
              settings: {
                ...currentSettings,
                custom_equipment_types: updated,
              },
            },
          });
        }
      }

      toast.success(`Renamed "${oldType}" to "${trimmed}" across ${affected.length} items`);
    } catch {
      toast.error("Failed to rename type");
    }

    setEditingType(null);
    setEditingValue("");
  };

  const hasPendingRoles = Object.keys(pendingRoles).length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="xl">
      <div className="flex gap-4 font-mp">
        <div className="flex flex-col gap-1 w-36 shrink-0 border-r border-neutral-100 pr-4">
          {isAdmin && (
            <button
              onClick={() => setSection("users")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all ${
                section === "users"
                  ? "bg-neutral-100 text-neutral-800"
                  : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              <Users size={13} /> Users
            </button>
          )}
          <button
            onClick={() => setSection("equipment")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all ${
              section === "equipment"
                ? "bg-neutral-100 text-neutral-800"
                : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <Package size={13} /> Equipment
          </button>
        </div>

        <div className="flex-1 min-h-[320px] flex flex-col">
          {section === "users" && isAdmin && (
            <div className="flex flex-col flex-1 gap-3">
              <Label className="text-[10px] uppercase font-bold text-neutral-400">Manage Users</Label>
              <div className="space-y-2 flex-1">
                {(profiles as any[]).map((profile) => {
                  const currentRole = pendingRoles[profile.id] ?? profile.role;
                  const isDirty = !!pendingRoles[profile.id];
                  return (
                    <div
                      key={profile.id}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl border bg-neutral-50 transition-colors ${isDirty ? "border-blue-200 bg-blue-50/30" : "border-neutral-100"}`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-neutral-800 capitalize">{profile.name}</span>
                        <span className="text-[10px] text-neutral-400">{profile.email}</span>
                      </div>
                      <select
                        value={currentRole}
                        onChange={(e) => handleRoleChange(profile.id, e.target.value as Role)}
                        className="text-xs border border-neutral-200 rounded-lg px-2 py-1 bg-white text-neutral-700 font-medium focus:outline-none focus:ring-1 focus:ring-neutral-300"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
              <Button
                onClick={handleSaveRoles}
                disabled={!hasPendingRoles || isSavingRoles}
                className="w-full h-9 text-xs gap-1.5 bg-neutral-900 hover:bg-neutral-700 transition-all"
              >
                <Save size={12} />
                {isSavingRoles ? "Saving..." : hasPendingRoles ? `Save ${Object.keys(pendingRoles).length} change${Object.keys(pendingRoles).length > 1 ? "s" : ""}` : "No changes"}
              </Button>
            </div>
          )}

          {section === "equipment" && (
            <div className="space-y-3">
              <Label className="text-[10px] uppercase font-bold text-neutral-400">Equipment Types</Label>
              <div className="space-y-2">
                {equipmentTypes.map((type) => (
                  <div
                    key={type}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-neutral-100 bg-neutral-50"
                  >
                    {editingType === type ? (
                      <Input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameType(type);
                          if (e.key === "Escape") setEditingType(null);
                        }}
                        autoFocus
                        className="h-7 text-xs px-2 py-0 w-full mr-2"
                      />
                    ) : (
                      <span className="text-xs font-medium text-neutral-700 capitalize">{type}</span>
                    )}
                    <div className="flex items-center gap-1 shrink-0">
                      {editingType === type ? (
                        <>
                          <button
                            onClick={() => handleRenameType(type)}
                            className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 transition-colors"
                          >
                            <Check size={13} />
                          </button>
                          <button
                            onClick={() => setEditingType(null)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 transition-colors"
                          >
                            <X size={13} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setEditingType(type); setEditingValue(type); }}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteType(type)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <Input
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddType(); }}
                  placeholder="New equipment type..."
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  onClick={handleAddType}
                  variant="ghost"
                  className="h-8 px-3 text-xs gap-1 border border-neutral-200"
                >
                  <Plus size={12} /> Add
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}