Write-Host "Yerel geliştirme sunucusu başlatılıyor..." -ForegroundColor Cyan

# Check if Python is available
try {
    $pythonVersion = python --version
    Write-Host "Python bulundu: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "Hata: Python yüklü değil! Lütfen Python'ı yükleyin." -ForegroundColor Red
    exit
}

Write-Host "Uygulama şu adresten erişilebilir olacak: http://localhost:8000" -ForegroundColor Yellow
Write-Host "Sunucuyu durdurmak için Ctrl+C tuşlarına basın." -ForegroundColor Gray

# Open browser automatically
Start-Process "http://localhost:8000"

# Start Python HTTP Server
python -m http.server 8000
