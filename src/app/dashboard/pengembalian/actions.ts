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
    include: { detail: true, pengembalian: true },
  });

  if (!peminjaman) {
    return { message: "Transaksi peminjaman tidak ditemukan." };
  }

  // Defense-in-depth: jangan hanya percaya field `status`. Jika baris
  // pengembalian sudah ada (misalnya akibat data tidak konsisten, atau dua
  // klik submit yang nyaris bersamaan), hentikan di sini dengan pesan yang
  // jelas — bukan mencoba insert lagi dan menabrak unique constraint.
  if (peminjaman.pengembalian || peminjaman.status !== "Dipinjam") {
    return { message: "Transaksi ini sudah pernah diproses pengembaliannya sebelumnya." };
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

      // Update bersyarat: hanya berhasil jika status masih "Dipinjam" saat ini
      // benar-benar dieksekusi di database (bukan hanya saat findUnique tadi).
      // Menutup celah race condition jika ada dua request berbarengan.
      const updated = await tx.peminjaman.updateMany({
        where: { id_peminjaman: idPeminjaman, status: "Dipinjam" },
        data: { status: "Selesai" },
      });
      if (updated.count === 0) {
        throw new Error("DUPLICATE_RETURN");
      }

      for (const item of detail) {
        await tx.buku.update({
          where: { id_buku: item.id_buku },
          data: { stok: { increment: item.jumlah } },
        });
      }
    });
  } catch (error) {
    const isDuplicate =
      (error instanceof Error && error.message === "DUPLICATE_RETURN") ||
      (typeof error === "object" && error !== null && "code" in error && error.code === "P2002");
    return {
      message: isDuplicate
        ? "Transaksi ini sudah pernah diproses pengembaliannya sebelumnya."
        : "Gagal memproses pengembalian. Coba lagi.",
    };
  }

  revalidatePath("/dashboard/peminjaman");
  revalidatePath("/dashboard/pengembalian");
  revalidatePath("/dashboard/buku");
  revalidatePath("/dashboard");
  redirect("/dashboard/pengembalian");
}
