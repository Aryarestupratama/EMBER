<?php

use App\Http\Controllers\AreaCheckController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RegionDetailController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| EMBER — Rute Publik (tidak perlu login)
|--------------------------------------------------------------------------
*/

Route::get('/', fn () => Inertia::render('Landing'))->name('home');

Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

Route::get('/area-check', [AreaCheckController::class, 'index'])->name('area-check');
Route::post('/area-check', [AreaCheckController::class, 'check'])
    ->middleware('throttle:20,1') // rate limit 20 request/menit per IP (Architecture.md §7)
    ->name('area-check.submit');

Route::get('/area/{region:slug}', [RegionDetailController::class, 'show'])->name('region.detail');

Route::get('/about', fn () => Inertia::render('About'))->name('about');

/*
|--------------------------------------------------------------------------
| Bawaan Breeze — Autentikasi & Profil (opsional untuk EMBER)
|--------------------------------------------------------------------------
| Tidak wajib dipakai untuk MVP (PRD.md tidak mensyaratkan akun pengguna),
| tapi dibiarkan tersedia untuk kebutuhan admin/internal di masa depan.
*/

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';