<?php

namespace App\Console\Commands;

use App\Domains\FireMonitoring\Models\FireHotspot;
use App\Domains\FireMonitoring\Services\IqairService;
use Illuminate\Console\Command;

/**
 * Command one-off. Dijalankan sekali secara manual setelah kolom
 * nearest_city_temp_c / nearest_city_heat_index_c ditambahkan ke
 * fire_hotspots, untuk mengisi retroaktif hotspot tinggi/sangat_tinggi
 * yang sudah lebih dulu ada di database.
 *
 * Bukan bagian dari scheduled job — tidak didaftarkan di Kernel.
 */
class BackfillHotspotTemperature extends Command
{
    protected $signature = 'ember:backfill-temperature
        {--dry-run : Tampilkan yang akan diproses tanpa menyimpan perubahan}';

    protected $description = 'Re-enrich hotspot tinggi/sangat_tinggi lama dengan data suhu IQAir (one-off)';

    public function handle(IqairService $iqair): int
    {
        $dryRun = (bool) $this->option('dry-run');

        // Hanya target row yang SUDAH PERNAH berhasil di-enrich IQAir
        // (nearest_city_aqi tidak null). Hotspot rendah/sedang memang
        // sengaja tidak pernah dipanggil IQAir (lihat Architecture.md §4.1)
        // dan tidak boleh ikut disentuh command ini.
        $hotspots = FireHotspot::whereIn('gfw_risk_category', ['tinggi', 'sangat_tinggi'])
            ->whereNotNull('nearest_city_aqi')
            ->whereNull('nearest_city_temp_c')
            ->get();

        $total = $hotspots->count();

        if ($total === 0) {
            $this->info('Tidak ada hotspot yang perlu di-backfill. Semua sudah punya data suhu atau memang belum pernah di-enrich IQAir.');
            return self::SUCCESS;
        }

        $this->info("Ditemukan {$total} hotspot untuk di-backfill." . ($dryRun ? ' (dry-run, tidak ada perubahan disimpan)' : ''));

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $success = 0;
        $failed = 0;

        foreach ($hotspots as $hotspot) {
            $result = $iqair->nearestCity((float) $hotspot->latitude, (float) $hotspot->longitude);

            if ($result && $result['temp_c'] !== null) {
                if (! $dryRun) {
                    $hotspot->update([
                        'nearest_city_temp_c'       => $result['temp_c'],
                        'nearest_city_heat_index_c' => $result['heat_index_c'],
                    ]);
                }
                $success++;
            } else {
                // Dibiarkan null — konsisten dengan prinsip null ≠ 0
                // (Rules.md §2). Tidak menghentikan proses row lainnya.
                $failed++;
            }

            $bar->advance();

            // Jeda antar call supaya tidak membakar kuota IQAir Community
            // Plan sekaligus. 300ms cukup aman untuk jumlah row seukuran MVP.
            usleep(300_000);
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Selesai. Berhasil: {$success}, gagal/null: {$failed}.");

        if ($failed > 0) {
            $this->warn("{$failed} hotspot gagal diambil datanya dari IQAir dan tetap null — bisa dijalankan ulang kapan saja (command ini idempotent, hanya menyasar row yang masih null).");
        }

        return self::SUCCESS;
    }
}