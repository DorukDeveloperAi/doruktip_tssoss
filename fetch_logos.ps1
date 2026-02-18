$urls = @(
    "https://doruktip.com/kurumlar-1.html",
    "https://doruktip.com/kurumlar-2.html",
    "https://doruktip.com/kurumlar-3.html",
    "https://doruktip.com/kurumlar-4.html"
)

$baseDir = "d:\antigravity\osstss\assets\logos"

foreach ($url in $urls) {
    Write-Host "Fetching $url..."
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
        $html = $response.Content
        
        # Regex to find all img sources
        $matches = [regex]::Matches($html, '<img[^>]+src=["'']([^"'']+)["'']')
        
        foreach ($match in $matches) {
            $imgUrl = $match.Groups[1].Value
            
            # Skip common icons/social media if possible, but let's be broad
            if ($imgUrl -match "\.(png|jpg|jpeg|svg|webp|gif)") {
                if ($imgUrl -notlike "http*") {
                    if ($imgUrl.StartsWith("/")) {
                        $imgUrl = "https://doruktip.com" + $imgUrl
                    }
                    else {
                        $imgUrl = "https://doruktip.com/" + $imgUrl
                    }
                }
                
                $fileName = Split-Path $imgUrl -Leaf
                if ($fileName.Contains("?")) { $fileName = $fileName.Split("?")[0] }
                
                # Filter out obvious non-logos like facebook icons if they are named so
                if ($fileName -match "(facebook|twitter|instagram|youtube|map|marker|call|mail)") { continue }

                $destPath = Join-Path $baseDir $fileName
                
                if (-not (Test-Path $destPath)) {
                    Write-Host "Downloading $imgUrl..."
                    try {
                        Invoke-WebRequest -Uri $imgUrl -OutFile $destPath -TimeoutSec 5
                    }
                    catch {
                        Write-Host "Failed: $imgUrl"
                    }
                }
            }
        }
    }
    catch {
        Write-Host "Failed to fetch $url"
    }
}
