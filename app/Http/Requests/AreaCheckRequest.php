<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AreaCheckRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lat' => ['required', 'numeric', 'between:-11,6'],
            'lon' => ['required', 'numeric', 'between:95,141'],
        ];
    }

    public function messages(): array
    {
        return [
            'lat.between' => 'Lokasi di luar cakupan wilayah Indonesia. Layanan ini fokus untuk wilayah Indonesia.',
            'lon.between' => 'Lokasi di luar cakupan wilayah Indonesia. Layanan ini fokus untuk wilayah Indonesia.',
        ];
    }
}