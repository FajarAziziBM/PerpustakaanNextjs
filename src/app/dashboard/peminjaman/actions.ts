"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { ActionState } from "@/lib/action-state";
import { peminjamanSchema } from "@/lib/validators/peminjaman";

export async function createPeminjamanAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) {
    return { message: "Sesi berakhir, silakan masuk kembali." };
  }

  const idBukuRaw = formData.getAll("id_buku[]");
  const jumlahRaw = formData.getAll("jumlah[]");
  const items = idBukuRaw.map((id_buku, i) => ({ id_buku, jumlah: jumlahRaw[i] }));

  const parsed = peminjamanSchema.safeParse({
    id_anggota: formData.get("id_anggota"),
    tanggal_kembali: formData.get("tanggal_kembali"),
    items,
  });

  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] === "items" ? "items" : String(issue.path[0] ?? "form");
      errors[key] = errors[key] ? [...errors[key], issue.message] : [issue.message];
    }
    return { errors };
  }

  const anggota = await db.anggota.findUnique({ where: { id_anggota: parsed.data.id_anggota } });
  if (!anggota) {
    return { errors: { id_anggota: ["Anggota tidak ditemukan."] } };
  }
  if (anggota.status !== "Aktif") {
    // Asumsi kebijakan: anggota Nonaktif tidak dapat meminjam — lihat
    // docs/specification.md §7 (perlu konfirmasi institusi, bisa diubah di sini).
    return { errors: { id_anggota: ["Anggota berstatus Nonaktif tidak dapat meminjam."] } };
  }

  try {
    await db.$transaction(async (tx) => {
      const bukuList = await tx.buku.findMany({
        where: { id_buku: { in: parsed.data.items.map((i) => i.id_buku) } },
      });
      const bukuMap = new Map(bukuList.map((b) => [b.id_buku, b]));

      for (const item of parsed.data.items) {
        const buku = bukuMap.get(item.id_buku);
        if (!buku) {
          throw new Error("Salah satu buku yang dipilih tidak ditemukan.");
        }
        if (buku.stok < item.jumlah) {
          throw new Error(`Stok "${buku.judul}" tidak cukup (tersedia: ${buku.stok}).`);
        }
      }

      // Petugas transaksi otomatis diambil dari akun yang sedang login (bukan field
      // pilihan bebas) demi keandalan jejak audit — lihat docs/architecture.md §5.
      const peminjaman = await tx.peminjaman.create({
        data: {
          id_anggota: parsed.data.id_anggota,
          id_petugas: session.ref_id,
          tanggal_kembali: new Date(parsed.data.tanggal_kembali),
        },
      });

      for (const item of parsed.data.items) {
        await tx.detail_peminjaman.create({
          data: { id_peminjaman: peminjaman.id_peminjaman, id_buku: item.id_buku, jumlah: item.jumlah },
        });

        // Decrement ATOMIK & BERSYARAT (stok >= jumlah dicek ulang oleh DB saat ini
        // juga, bukan hanya hasil baca di atas) — menutup celah race condition bila
        // ada dua transaksi peminjaman berebut buku yang sama secara bersamaan.
        const updated = await tx.buku.updateMany({
          where: { id_buku: item.id_buku, stok: { gte: item.jumlah } },
          data: { stok: { decrement: item.jumlah } },
        });
        if (updated.count === 0) {
          const buku = bukuMap.get(item.id_buku);
          throw new Error(`Stok "${buku?.judul ?? "buku"}" tidak cukup saat transaksi diproses.`);
        }
      }
    });
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Gagal menyimpan transaksi peminjaman." };
  }

  revalidatePath("/dashboard/peminjaman");
  revalidatePath("/dashboard/buku");
  revalidatePath("/dashboard");
  redirect("/dashboard/peminjaman");
}

/**
 * Membatalkan peminjaman yang salah input (hanya selama status masih "Dipinjam"
 * DAN belum ada baris pengembalian sama sekali). Mengembalikan stok setiap buku,
 * lalu menghapus baris peminjaman (detail_peminjaman ikut terhapus lewat
 * onDelete: Cascade di schema).
 */
export async function batalkanPeminjamanAction(id: number, currentStatus?: string): Promise<void> {
  let blocked = false;

  try {
    await db.$transaction(async (tx) => {
      const peminjaman = await tx.peminjaman.findUnique({
        where: { id_peminjaman: id },
        include: { detail: true, pengembalian: true },
      });

      // Defense-in-depth: jangan hanya percaya field `status`. Jika baris
      // pengembalian sudah ada (data tidak konsisten, atau race condition),
      // batalkan operasi di sini — bukan mencoba delete dan menabrak FK
      // constraint `pengembalian_id_peminjaman_fkey`.
      if (!peminjaman || peminjaman.pengembalian || peminjaman.status !== "Dipinjam") {
        blocked = true;
        return;
      }

      for (const item of peminjaman.detail ?? []) {
        await tx.buku.update({
          where: { id_buku: item.id_buku },
          data: { stok: { increment: item.jumlah } },
        });
      }
      await tx.peminjaman.delete({ where: { id_peminjaman: id } });
    });
  } catch {
    blocked = true;
  }

  revalidatePath("/dashboard/peminjaman");
  revalidatePath("/dashboard/buku");
  revalidatePath("/dashboard");

  if (blocked) {
    const params = new URLSearchParams();
    if (currentStatus) params.set("status", currentStatus);
    params.set("error", "batal-gagal");
    redirect(`/dashboard/peminjaman?${params.toString()}`);
  }
}
