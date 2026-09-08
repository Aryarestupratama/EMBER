export default function SourceCredit({ className = '' }) {
    return (
        <p className={`text-xs text-ink/50 ${className}`}>
            Data hotspot: NASA FIRMS · Data risiko deforestasi: Global Forest Watch ·
            Data kualitas udara: IQAir · Batas wilayah: GADM v4.1 · Panduan
            kesiapsiagaan: BNPB
        </p>
    );
}