import { Popup } from 'react-leaflet';
import { MapPin, Gauge, Calendar, Flame as FlameIcon, TreePine } from 'lucide-react';
import { RISK_CONFIG } from '@/components/RiskBadge';

// Kategori yang dapat ikon pohon vs api — dicek dari label, bukan diduplikasi
// dari ICON_SHAPE di MapView.jsx (yang itu khusus untuk divIcon marker di
// peta). Cukup: 'rendah' = pohon, selain itu = api.
function categoryIcon(category) {
    return category === 'rendah' ? TreePine : FlameIcon;
}

/**
 * Popup detail titik hotspot, dipasang lewat <Marker>/<CircleMarker> di
 * MapView.jsx. Diekstrak jadi komponen sendiri (bukan fungsi lokal di
 * MapView) supaya konsisten dengan pola komponen lain (RiskBadge,
 * ScoreBreakdown) — lebih gampang di-test/diubah terpisah dari logic peta.
 *
 * Ukuran sengaja dibuat compact (w-48, p-3) — versi sebelumnya (w-56, p-4)
 * kelihatan kebesaran untuk konten yang cuma 4 baris info, apalagi di peta
 * yang areanya sendiri sudah terbatas.
 *
 * PENTING soal elemen teks: sengaja dipakai <span>/<div>, BUKAN <p>.
 * Leaflet punya default stylesheet bawaan (leaflet.css) yang menerapkan
 * `.leaflet-popup-content p { margin: 18px 0; }` — override di app.css
 * sebelumnya cuma matikan padding wrapper popup, bukan margin bawaan pada
 * <p> ini. Efeknya, tiap baris yang pakai <p> dapat jarak ekstra 18px
 * atas-bawah dari Leaflet, bukan dari className di sini — itu sumber gap
 * besar yang kelihatan di popup. Karena komponen ini murni presentational
 * (bukan artikel/dokumen panjang yang butuh semantik <p>), aman & lebih
 * predictable pakai <span>/<div> supaya spacing 100% dikontrol Tailwind,
 * tidak tercampur aturan Leaflet.
 */
export default function HotspotPopup({ hotspot }) {
    const category = hotspot.gfw_risk_category;
    const config = RISK_CONFIG[category] ?? RISK_CONFIG.na;
    const CategoryIcon = categoryIcon(category);

    // hotspot.region berasal dari relasi region_id (di-eager-load backend) —
    // wilayah administratif hasil assignment saat ingest, SUMBER SAMA dengan
    // yang dipakai RegionRankingList (bukan "kota terdekat" seperti
    // nearest_city_name yang coverage-nya jarang keisi). region_id tetap bisa
    // null untuk sebagian kecil baris (assignment di ingest kadang lewat),
    // makanya tetap fallback ke koordinat kalau relasinya kosong.
    const regionName = hotspot.region?.name ?? null;
    const coordText = `${parseFloat(hotspot.latitude).toFixed(4)}, ${parseFloat(hotspot.longitude).toFixed(4)}`;

    // Ditampilkan menggantikan FRP di baris detail bawah — "kapan titik ini
    // terdeteksi" jauh lebih actionable buat pengguna umum di peta nasional
    // dibanding Fire Radiative Power (satuan MW, istilah teknis remote
    // sensing yang tidak umum dikenal). FRP tetap ada, cuma dipindah ke
    // tabel detail RegionDetail.jsx yang memang ditujukan untuk audiens
    // yang butuh presisi teknis (peneliti/pemda/juri).
    //
    // acq_date ternyata TIDAK ikut ter-load di payload yang dikirim ke
    // MapView (beda dari RegionDetail.jsx yang query-nya eager-load kolom
    // ini). Guard eksplisit di sini, bukan langsung `new Date(hotspot.acq_date)`
    // — tanpa guard, field undefined akan jadi `Invalid Date` yang lolos ke
    // layar. Fallback "Tidak diketahui" dipakai (bukan disembunyikan diam-diam
    // atau ditampilkan kosong), konsisten dengan prinsip Rules.md §5: data
    // yang gagal/tidak tersedia harus dinyatakan jujur, bukan disamarkan.
    const detectedAtText = hotspot.acq_date
        ? new Date(hotspot.acq_date).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
          })
        : 'Tidak diketahui';

    return (
        <Popup minWidth={200}>
            {/* p-3: padding bawaan Leaflet sudah dimatikan lewat override di
                app.css (.leaflet-popup-content), jadi komponen ini yang pegang
                kendali penuh atas spacing-nya sendiri. */}
            <div className="w-48 p-3">
                {/* Header: nama wilayah (dari region_id) + koordinat sebagai
                    subtitle. Kalau region_id null, koordinat naik jadi baris
                    utama (bukan ditampilkan kosong/error). */}
                <div className="mb-2 flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-ink/40" />
                    <div className="min-w-0">
                        {regionName ? (
                            <>
                                <div className="truncate text-xs font-semibold leading-tight text-ink">
                                    {regionName}
                                </div>
                                <div className="tabular-nums text-[10px] leading-tight text-ink/50">
                                    {coordText}
                                </div>
                            </>
                        ) : (
                            <div className="tabular-nums text-[10px] leading-tight text-ink/50">
                                {coordText}
                            </div>
                        )}
                    </div>
                </div>

                {/* Baris statistik utama: label kategori berwarna di kiri +
                    ikon bulat bertema warna yang sama di kanan. */}
                <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                        <div className={`text-lg font-bold leading-none ${config.textClass}`}>
                            {config.label}
                        </div>
                        <div className="mt-1 text-[10px] font-medium leading-tight text-ink/50">
                            Kategori Risiko Karhutla
                        </div>
                    </div>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.softBgClass}`}>
                        <CategoryIcon className={`h-4 w-4 ${config.textClass}`} strokeWidth={2.2} />
                    </div>
                </div>

                {/* Divider putus-putus + baris detail: ikon abu-abu + label di
                    kiri, value tabular-nums bold di kanan. */}
                <div className="space-y-1.5 border-t border-dashed border-black/10 pt-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-ink/60">
                            <Gauge className="h-3 w-3 text-ink/40" />
                            Keyakinan Deteksi
                        </span>
                        {/* Sebelumnya text-forest-dark (hijau) tetap, tak peduli
                            nilainya — itu menyesatkan karena confidence rendah pun
                            ikut kelihatan "positif". Confidence bukan indikator
                            risiko, jadi warnanya dinetralkan (text-ink), bukan
                            dipetakan ke skala warna risiko yang berbeda konsep. */}
                        <span className="tabular-nums font-semibold text-ink">
                            {hotspot.confidence}%
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-ink/60">
                            <Calendar className="h-3 w-3 text-ink/40" />
                            Terdeteksi
                        </span>
                        <span
                            className={`tabular-nums ${
                                hotspot.acq_date ? 'font-semibold text-ink' : 'text-ink/40'
                            }`}
                        >
                            {detectedAtText}
                        </span>
                    </div>
                </div>
            </div>
        </Popup>
    );
}