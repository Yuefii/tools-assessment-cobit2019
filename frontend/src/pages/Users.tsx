import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { userAPI } from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Search, Edit2, Trash2, Shield, User as UserIcon, UserCheck, ChevronLeft, ChevronRight, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROLES = ['Admin', 'Assessor', 'Auditee'];

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [deleteUser, setDeleteUser] = useState<any>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Auditee' });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => { fetchUsers(); }, [page, limit, debouncedSearch]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userAPI.getAll(page, limit, debouncedSearch);
      setUsers(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 0);
      setError('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditUser(null);
    setForm({ name: '', email: '', password: '', role: 'Auditee' });
    setShowModal(true);
  };

  const openEdit = (u: any) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role?.name || 'Auditee' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editUser) {
        await userAPI.update(editUser.id, { name: form.name, email: form.email, role: form.role });
      } else {
        await userAPI.create({ name: form.name, email: form.email, password: form.password, role: form.role });
      }
      setShowModal(false);
      await fetchUsers();
      toast.success(editUser ? 'Pengguna berhasil diperbarui!' : 'Pengguna baru berhasil dibuat!');
    } catch (e: any) {
      toast.error(e.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteUser) return;
    try {
      await userAPI.delete(deleteUser.id);
      setDeleteUser(null);
      await fetchUsers();
      toast.success('Pengguna berhasil dihapus!');
    } catch (e: any) {
      toast.error(e.message || 'Gagal menghapus pengguna');
    }
  };

  const confirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUser || newPassword.length < 6) return;
    setIsResetting(true);
    try {
      await userAPI.adminResetPassword(resetPasswordUser.id, newPassword);
      setResetPasswordUser(null);
      setNewPassword('');
      toast.success('Password berhasil di-reset!');
    } catch (e: any) {
      toast.error(e.message || 'Gagal mereset password');
    } finally {
      setIsResetting(false);
    }
  };

  const getRoleIcon = (roleName: string) => {
    if (roleName === 'Admin') return <Shield className="w-3.5 h-3.5 mr-1" />;
    if (roleName === 'Assessor') return <UserCheck className="w-3.5 h-3.5 mr-1" />;
    return <UserIcon className="w-3.5 h-3.5 mr-1" />;
  };

  const getRoleColor = (roleName: string) => {
    if (roleName === 'Admin') return 'bg-violet-100 text-violet-800 hover:bg-violet-200 border-violet-200';
    if (roleName === 'Assessor') return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200';
    return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Manajemen Pengguna</h1>
          <p className="text-muted-foreground text-sm">Kelola akses sistem untuk Administrator, Assessor, dan Auditee.</p>
        </div>
        <Button size="lg" onClick={openCreate} className="w-full sm:w-auto h-11 px-6 font-semibold">
          <Plus className="mr-2 h-5 w-5" />
          Tambah Pengguna
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm font-medium p-4 rounded-lg border border-destructive/20">
          {error}
        </div>
      )}

      <Card className="border-border shadow-sm">
        <CardHeader className="p-4 sm:p-6 bg-muted/20 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Daftar Pengguna</CardTitle>
              <CardDescription>Terdapat {total} pengguna di dalam sistem</CardDescription>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama atau email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 w-full bg-background border-input"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm font-medium">Memuat data pengguna...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-foreground">Profil Pengguna</TableHead>
                    <TableHead className="font-bold text-foreground">Peran (Role)</TableHead>
                    <TableHead className="font-bold text-foreground text-right pr-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map(u => (
                      <TableRow key={u.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                              {u.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-foreground">{u.name}</div>
                              <div className="text-muted-foreground text-xs">{u.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("font-semibold border", getRoleColor(u.role?.name))}>
                            {getRoleIcon(u.role?.name)}
                            {u.role?.name || 'Auditee'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => { setResetPasswordUser(u); setNewPassword(''); }} className="h-8 w-8 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10" title="Reset Password">
                              <KeyRound className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(u)} className="h-8 w-8 text-muted-foreground hover:text-primary" title="Edit Pengguna">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteUser(u)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                        Tidak ada pengguna yang ditemukan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Menampilkan {users.length} dari {total} pengguna
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Sebelumnya
              </Button>
              <div className="text-sm font-medium">
                Halaman {page} dari {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Selanjutnya
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal / Dialog Form */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{editUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap <span className="text-destructive">*</span></Label>
              <Input id="name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Masukkan nama..." />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
              <Input id="email" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="nama@perusahaan.com" />
            </div>

            {!editUser && (
              <div className="space-y-2">
                <Label htmlFor="password">Password Sementara <span className="text-destructive">*</span></Label>
                <Input id="password" type="password" required minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Minimal 6 karakter..." />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Hak Akses (Role) <span className="text-destructive">*</span></Label>
              <Select value={form.role} onValueChange={(val) => setForm({...form, role: val})}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => (
                    <SelectItem key={r} value={r}>
                      <div className="flex items-center">
                        {getRoleIcon(r)}
                        <span className="ml-1">{r}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} disabled={submitting}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="font-semibold">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editUser ? 'Simpan Perubahan' : 'Buat Pengguna'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengguna</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengguna <strong className="text-foreground">{deleteUser?.name}</strong>? Tindakan ini tidak dapat dibatalkan dan pengguna tersebut akan kehilangan akses ke sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetPasswordUser} onOpenChange={(open) => !open && setResetPasswordUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Ubah password untuk pengguna <strong>{resetPasswordUser?.name}</strong>. Pastikan untuk memberikan password baru ini kepada pengguna tersebut.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={confirmResetPassword} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="new-admin-password">Password Baru <span className="text-destructive">*</span></Label>
              <Input 
                id="new-admin-password" 
                type="password" 
                required 
                minLength={6} 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                placeholder="Minimal 6 karakter..." 
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setResetPasswordUser(null)} disabled={isResetting}>
                Batal
              </Button>
              <Button type="submit" disabled={isResetting} className="bg-amber-600 hover:bg-amber-700 text-white">
                {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
