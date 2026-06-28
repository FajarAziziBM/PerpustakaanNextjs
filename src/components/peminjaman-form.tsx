"use client";

import { useActionState, useRef, useState } from "react";
import type { ActionState } from "@/lib/action-state";

export interface AnggotaOption {
  id_anggota: number;
  nama: string;
}

export interface BukuOption {
  id_buku: number;
  judul: string;
  stok: number;
}

interface PeminjamanFormProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  anggotaOptions: AnggotaOption[];
  bukuOptions: BukuOption[];
  defaultTanggalKembali: string;
}

interface LineItem {
  key: number;
  idBuku: string;
  jumlah: string;
}

const inputClass =
  "mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600";

const initialState: ActionState = {};

export function PeminjamanForm({
  action,
  anggotaOptions,
  bukuOptions,
  defaultTanggalKembali,
}: PeminjamanFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [lines, setLines] = useState<LineItem[]>([{ key: 0, idBuku: "", jumlah: "1" }]);
  const nextKeyRef = useRef(1);

  function addLine() {
    setLines((prev) => [...prev, { key: nextKeyRef.current++, idBuku: "", jumlah: "1" }]);
  }

  function removeLine(key: number) {
    setLines((prev) => (prev.length > 1 ? prev.filter((line) => line.key !== key) : prev));
  }

  function patchLine(key: number, patch: Partial<Pick<LineItem, "idBuku" | "jumlah">>) {
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.message && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>
      )}

      <div>
        <label htmlFor="id_anggota" className="block text-sm font-medium text-slate-700">
          Anggota
        </label>
        <select id="id_anggota" name="id_anggota" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            — Pilih anggota —
          </option>
          {anggotaOptions.map((a) => (
            <option key={a.id_anggota} value={a.id_anggota}>
              {a.nama}
            </option>
          ))}
        </select>
        {state.errors?.id_anggota && (
          <p className="mt-1 text-xs text-red-600">{state.errors.id_anggota[0]}</p>
        )}
        {anggotaOptions.length === 0 && (
          <p className="mt-1 text-xs text-slate-400">
            Belum ada anggota berstatus Aktif. Tambahkan anggota terlebih dahulu.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="tanggal_kembali" className="block text-sm font-medium text-slate-700">
          Tanggal Kembali (target)
        </label>
        <input
          id="tanggal_kembali"
          name="tanggal_kembali"
          type="date"
          required
          defaultValue={defaultTanggalKembali}
          className={inputClass}
        />
        {state.errors?.tanggal_kembali && (
          <p className="mt-1 text-xs text-red-600">{state.errors.tanggal_kembali[0]}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <span className="block text-sm font-medium text-slate-700">Daftar Buku</span>
          <button
            type="button"
            onClick={addLine}
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            + Tambah Baris
          </button>
        </div>

        <div className="mt-2 space-y-2">
          {lines.map((line) => (
            <div key={line.key} className="flex items-start gap-2">
              <select
                name="id_buku[]"
                required
                value={line.idBuku}
                onChange={(e) => patchLine(line.key, { idBuku: e.target.value })}
                className={`${inputClass} flex-1`}
              >
                <option value="" disabled>
                  — Pilih buku —
                </option>
                {bukuOptions.map((b) => (
                  <option key={b.id_buku} value={b.id_buku} disabled={b.stok <= 0}>
                    {b.judul} (stok: {b.stok})
                  </option>
                ))}
              </select>
              <input
                name="jumlah[]"
                type="number"
                min={1}
                required
                value={line.jumlah}
                onChange={(e) => patchLine(line.key, { jumlah: e.target.value })}
                className={`${inputClass} w-20`}
              />
              <button
                type="button"
                onClick={() => removeLine(line.key)}
                disabled={lines.length === 1}
                className="mt-1 rounded-lg border border-slate-300 px-2 py-2 text-xs text-slate-500 hover:bg-slate-50 disabled:opacity-40"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>

        {bukuOptions.length === 0 && (
          <p className="mt-1 text-xs text-slate-400">Belum ada data buku. Tambahkan buku terlebih dahulu.</p>
        )}
        {state.errors?.items && <p className="mt-1 text-xs text-red-600">{state.errors.items[0]}</p>}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {isPending ? "Menyimpan..." : "Simpan Peminjaman"}
      </button>
    </form>
  );
}
