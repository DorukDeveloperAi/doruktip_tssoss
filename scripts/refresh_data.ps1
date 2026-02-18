Write-Host "Doktor verileri yenileniyor..." -ForegroundColor Cyan
python scripts/fetch_doctors.py
if ($LASTEXITCODE -eq 0) {
    Write-Host "Veriler başarıyla güncellendi!" -ForegroundColor Green
} else {
    Write-Host "Bir hata oluştu. Lütfen Python betiğini ve internet bağlantınızı kontrol edin." -ForegroundColor Red
}
