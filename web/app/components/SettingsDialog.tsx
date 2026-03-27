"use client";

import Modal from "./Modal";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Package, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { useGetRows, useUpdateRow, useCreateRow, useDeleteRow } from "@/services/lib/hooks/useDatabase";
import { useUser } from "@/services/lib/hooks/useAuth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type Role = "Admin" | "Dev" | "Operator";
type Section = "users" | "equipment";

const ROLES: Role[] = ["Admin", "Dev", "Operator"];

export default function SettingsDialog({ isOpen, onClose }: Props) {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const isAdmin = user?.role === "Admin" || user?.role === "Dev";
  const [section, setSection] = useState<Section>("equipment");

  const { data: profiles = [] } = useGetRows("Profiles");
  const { data: stockRows = [] } = useGetRows("Stock");
  const updateProfile = useUpdateRow("Profiles");
  const createProfile = useCreateRow("Profiles");
  const deleteProfile = useDeleteRow("Profiles");
  const updateStock = useUpdateRow("Stock");

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", role: "Operator" as Role });

  const [customTypes, setCustomTypes] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("custom_equipment_types") ?? "[]"); }
    catch { return []; }
  });

  const [pendingRoles, setPendingRoles] = useState<Record<string, Role>>({});
  const [newType, setNewType] = useState("");
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [isSavingRoles, setIsSavingRoles] = useState(false);

  const stockDerivedTypes = Array.from(new Set((stockRows as any[]).map(r => r.item_properties?.equipment_type).filter(Boolean))) as string[];
  const equipmentTypes = Array.from(new Set([...stockDerivedTypes, ...customTypes])) as string[];

  const handleRoleChange = (profileId: string, newRole: Role) => {
    setPendingRoles(prev => ({ ...prev, [profileId]: newRole }));
  };

  const handleSaveRoles = async () => {
    setIsSavingRoles(true);
    try {
      await Promise.all(Object.entries(pendingRoles).map(([profileId, role]) =>
        updateProfile.mutateAsync({ id: profileId, data: { role } })
      ));
      setPendingRoles({});
      await queryClient.invalidateQueries({ queryKey: ["Profiles"] });
      toast.success("Roles saved successfully");
    } catch {
      toast.error("Failed to save roles");
    } finally {
      setIsSavingRoles(false);
    }
  };

  const handleAddType = () => {
    const trimmed = newType.trim().toLowerCase();
    if (!trimmed) return;
    if (equipmentTypes.includes(trimmed)) { toast.error("Type already exists"); return; }
    const updated = [...customTypes, trimmed];
    setCustomTypes(updated);
    localStorage.setItem("custom_equipment_types", JSON.stringify(updated));
    setNewType("");
    toast.success(`${trimmed.charAt(0).toUpperCase() + trimmed.slice(1)} added`);
  };

  const handleDeleteType = (type: string) => {
    if (!customTypes.includes(type)) {
      toast.error("Cannot delete a type assigned to inventory items");
      return;
    }
    const updated = customTypes.filter(t => t !== type);
    setCustomTypes(updated);
    localStorage.setItem("custom_equipment_types", JSON.stringify(updated));
    toast.success(`"${type}" removed`);
  };

  const handleRenameType = async (oldType: string) => {
    const trimmed = editingValue.trim().toLowerCase();
    if (!trimmed || trimmed === oldType) { setEditingType(null); return; }

    const affected = (stockRows as any[]).filter((r) => r.item_properties?.equipment_type === oldType);

    try {
      await Promise.all(
        affected.map((row) =>
          updateStock.mutateAsync({
            id: row.id,
            data: { item_properties: { ...row.item_properties, equipment_type: trimmed } },
          })
        )
      );

      if (customTypes.includes(oldType)) {
        const updated = customTypes.map(t => t === oldType ? trimmed : t);
        setCustomTypes(updated);
        localStorage.setItem("custom_equipment_types", JSON.stringify(updated));
      }

      await queryClient.invalidateQueries({ queryKey: ["Stock"] });
      toast.success(`Renamed "${oldType}" to "${trimmed}" across ${affected.length} items`);
    } catch {
      toast.error("Failed to rename type");
    }

    setEditingType(null);
    setEditingValue("");
  };

  const hasPendingRoles = Object.keys(pendingRoles).length > 0;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="xl">
        <div className="flex gap-4 font-mp">
          <div className="flex flex-col gap-1 w-36 shrink-0 border-r border-neutral-100 pr-4">
            {isAdmin && (
              <button
                onClick={() => setSection("users")}
                className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all hover:scale-103 ${section === "users" ? "bg-neutral-100 text-neutral-800" : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"}`}
              >
                <Users size={13} /> Users
              </button>
            )}
            <button
              onClick={() => setSection("equipment")}
              className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all hover:scale-103 ${section === "equipment" ? "bg-neutral-100 text-neutral-800" : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"}`}
            >
              <Package size={13} /> Equipment
            </button>
          </div>

          <div className="flex-1 min-h-[320px] flex flex-col">
            {section === "users" && isAdmin && (
              <div className="flex flex-col flex-1 gap-3">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] uppercase font-bold text-neutral-400">Manage Users</Label>
                  <Button
                    onClick={() => {
                      setEditingUser(null);
                      setUserForm({ name: "", email: "", role: "Operator" });
                      setIsUserModalOpen(true);
                    }}
                    className="cursor-pointer h-7 text-xs gap-1 hover:scale-103"
                  >
                    <Plus size={12} /> Add User
                  </Button>
                </div>

                <div className="space-y-2 flex-1">
                  {(profiles as any[]).map((profile) => {
                    const currentRole = pendingRoles[profile.id] ?? profile.role;
                    const isDirty = !!pendingRoles[profile.id];
                    return (
                      <div
                        key={profile.id}
                        className={`cursor-pointer flex items-center justify-between px-3 py-2.5 rounded-xl border bg-neutral-50 transition-all hover:scale-103 ${isDirty ? "border-blue-200 bg-blue-50/30" : "border-neutral-100"}`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-neutral-800 capitalize">{profile.name}</span>
                          <span className="text-[10px] text-neutral-400">{profile.email}</span>
                        </div>
                        <div className="flex items-center">
                          <select
                            value={currentRole}
                            onChange={(e) => handleRoleChange(profile.id, e.target.value as Role)}
                            className="cursor-pointer text-xs border border-neutral-200 rounded-lg px-2 py-1 bg-white text-neutral-700 font-medium focus:outline-none focus:ring-1 focus:ring-neutral-300"
                          >
                            {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                          </select>
                          <button
                            onClick={() => {
                              setEditingUser(profile);
                              setUserForm({ name: profile.name, email: profile.email, role: profile.role });
                              setIsUserModalOpen(true);
                            }}
                            className="ml-2 cursor-pointer p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 hover:scale-103 transition-all"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await deleteProfile.mutateAsync(profile.id);
                                await queryClient.invalidateQueries({ queryKey: ["Profiles"] });
                                toast.success("User deleted");
                              } catch {
                                toast.error("Failed to delete user");
                              }
                            }}
                            className="ml-1 cursor-pointer p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 hover:scale-103 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  onClick={handleSaveRoles}
                  disabled={!hasPendingRoles || isSavingRoles}
                  className="cursor-pointer w-full h-9 text-xs gap-1.5 bg-neutral-900 hover:bg-neutral-700 hover:scale-103 transition-all"
                >
                  {isSavingRoles ? "Saving..." : hasPendingRoles ? `Save ${Object.keys(pendingRoles).length} change${Object.keys(pendingRoles).length > 1 ? "s" : ""}` : "No changes"}
                </Button>
              </div>
            )}

            {section === "equipment" && (
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-bold text-neutral-400">Equipment Types</Label>
                <div className="space-y-2">
                  {equipmentTypes.map((type) => (
                    <div key={type} className="cursor-pointer flex items-center justify-between px-3 py-2.5 rounded-xl border border-neutral-100 bg-neutral-50 hover:scale-103 transition-all">
                      {editingType === type ? (
                        <Input
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleRenameType(type); if (e.key === "Escape") setEditingType(null); }}
                          autoFocus
                          className="h-7 text-xs px-2 py-0 w-full mr-2"
                        />
                      ) : (
                        <span className="text-xs font-medium text-neutral-700 capitalize">{type}</span>
                      )}
                      <div className="flex items-center gap-1 shrink-0">
                        {editingType === type ? (
                          <>
                            <button onClick={() => handleRenameType(type)} className="cursor-pointer p-1.5 rounded-lg text-green-500 hover:bg-green-50 hover:scale-103 transition-all"><Check size={13} /></button>
                            <button onClick={() => setEditingType(null)} className="cursor-pointer p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:scale-103 transition-all"><X size={13} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingType(type); setEditingValue(type); }} className="cursor-pointer p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 hover:scale-103 transition-all"><Pencil size={13} /></button>
                            <button onClick={() => handleDeleteType(type)} className="cursor-pointer p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 hover:scale-103 transition-all"><Trash2 size={13} /></button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <Input value={newType} onChange={(e) => setNewType(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleAddType(); }} placeholder="New equipment type..." className="h-8 text-xs cursor-pointer hover:scale-103 transition-all" />
                  <Button type="button" onClick={handleAddType} variant="ghost" className="cursor-pointer h-8 px-3 text-xs gap-1 border border-neutral-200 hover:scale-103 transition-all"><Plus size={12} /> Add</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={editingUser ? "Edit User" : "Add User"}
        size="sm"
      >
        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              className="cursor-pointer hover:scale-103 transition-all"
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              className="cursor-pointer hover:scale-103 transition-all"
            />
          </div>

          <div>
            <Label>Role</Label>
            <select
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value as Role })}
              className="cursor-pointer w-full border rounded-lg px-2 py-1 text-xs hover:scale-103 transition-all"
            >
              {ROLES.map(role => <option key={role}>{role}</option>)}
            </select>
          </div>

          <Button
            onClick={async () => {
              try {
                if (editingUser) {
                  await updateProfile.mutateAsync({ id: editingUser.id, data: userForm });
                  toast.success("User updated");
                } else {
                  await createProfile.mutateAsync({ data: userForm });
                  toast.success("User created");
                }
                await queryClient.invalidateQueries({ queryKey: ["Profiles"] });
                setIsUserModalOpen(false);
              } catch {
                toast.error("Failed to save user");
              }
            }}
            className="cursor-pointer w-full hover:scale-103 transition-all"
          >
            {editingUser ? "Save Changes" : "Create User"}
          </Button>
        </div>
      </Modal>
    </>
  );
}