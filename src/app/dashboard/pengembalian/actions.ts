"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hitungKeterlambatanHari, hitungDenda } from "@/lib/denda";
import { getActiveTarifDenda } from "@/lib/pengaturan-denda";
import type { ActionState } from "@/lib/action-state";

export async function prosesPengembalianAction(
  idPeminjaman: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const tanggalDikembalikanRaw = String(formData.get("tanggal_dikembalikan") ?? "");
  if (!tanggalDikembalikanRaw) {
    return { errors: { tanggal_dikembalikan: ["Tanggal pengembalian wajib diisi."] } };
  }
  const tanggalDikembalikan = new Date(tanggalDikembalikanRaw);

  const peminjaman = await db.peminjaman.findUnique({
    where: { id_peminjaman: idPeminjaman },
    include: { detail: true },
  });

  if (!peminjaman || peminjaman.status !== "Dipinjam") {
    return { message: "Transaksi peminjaman tidak ditemukan atau sudah selesai." };
  }

  const detail = peminjaman.detail ?? [];
  const totalBuku = detail.reduce((sum, d) => sum + d.jumlah, 0);
  const terlambat = hitungKeterlambatanHari(peminjaman.tanggal_kembali, tanggalDikembalikan);
  const tarif = await getActiveTarifDenda();
  const denda = hitungDenda(terlambat, tarif, totalBuku);

  try {
    await db.$transaction(async (tx) => {
      await tx.pengembalian.create({
        data: {
          id_peminjaman: idPeminjaman,
          tanggal_dikembalikan: tanggalDikembalikan,
          terlambat,
          denda,
        },
      });

      await tx.peminjaman.update({
        where: { id_peminjaman: idPeminjaman },
        data: { status: "Selesai" },
      });

      for (const item of detail) {
        await tx.buku.update({
          where: { id_buku: item.id_buku },
          data: { stok: { increment: item.jumlah } },
        });
      }
    });
  } catch {
    return { message: "Gagal memproses pengembalian. Coba lagi." };
  }

  revalidatePath("/dashboard/peminjaman");
  revalidatePath("/dashboard/pengembalian");
  revalidatePath("/dashboard/buku");
  revalidatePath("/dashboard");
  redirect("/dashboard/pengembalian");
}
