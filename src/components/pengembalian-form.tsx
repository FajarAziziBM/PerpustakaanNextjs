"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/lib/action-state";

interface PengembalianFormProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaultTanggal: string;
  tanggalKembaliTarget: string;
  tarifPerHari: number;
  totalBuku: number;
}

function hitungKeterlambatanHariClient(targetISO: string, dikembalikanISO: string): number {
  const target = new Date(targetISO);
  const dikembalikan = new Date(dikembalikanISO);
  const ms = dikembalikan.getTime() - target.getTime();
  const hari = Math.floor(ms / (1000 * 60 * 60 * 24));
  return hari > 0 ? hari : 0;
}

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const initialState: ActionState = {};

export function PengembalianForm({
  action,
  defaultTanggal,
  tanggalKembaliTarget,
  tarifPerHari,
  totalBuku,
}: PengembalianFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [tanggal, setTanggal] = useState(defaultTanggal);

  const terlambat = hitungKeterlambatanHariClient(tanggalKembaliTarget, tanggal);
  const denda = terlambat * tarifPerHari * totalBuku;

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>
      )}

      <div>
        <label htmlFor="tanggal_dikembalikan" className="block text-sm font-medium text-slate-700">
          Tanggal Dikembalikan
        </label>
        <input
          id="tanggal_dikembalikan"
          name="tanggal_dikembalikan"
          type="date"
          required
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
        />
        {state.errors?.tanggal_dikembalikan && (
          <p className="mt-1 text-xs text-red-600">{state.errors.tanggal_dikembalikan[0]}</p>
        )}
      </div>

      <div className="rounded-lg bg-slate-50 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Keterlambatan</span>
          <span className="font-medium text-slate-900">{terlambat} hari</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-slate-500">Tarif</span>
          <span className="font-medium text-slate-900">{currency.format(tarifPerHari)} / hari / buku</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-slate-200 pt-2">
          <span className="font-medium text-slate-700">Total Denda</span>
          <span className="text-base font-semibold text-slate-900">{currency.format(denda)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {isPending ? "Memproses..." : "Konfirmasi Pengembalian"}
      </button>
    </form>
  );
}
