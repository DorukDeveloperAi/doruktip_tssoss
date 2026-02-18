$urls = @(
    "https://doruktip.com/kurumlar-1.html",
    "https://doruktip.com/kurumlar-2.html",
    "https://doruktip.com/kurumlar-3.html",
    "https://doruktip.com/kurumlar-4.html"
)

$mapping = @()

foreach ($url in $urls) {
    Write-Host "Parsing $url..."
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing
    $html = $response.Content
    
    # We need to find patterns like:
    # <img src=".../XXX.png"> ... <h4>NAME</h4>
    # or similar.
    # Let's try to find blocks of content.
    # Frequently these are in a specific div.
    
    # Look for image and then the next header tag
    $regex = '<img[^>]+src=["'']([^"'']+)["''][^>]*>.*?<h[45][^>]*>(.*?)</h'
    $matches = [regex]::Matches($html, $regex, [System.Text.RegularExpressions.RegexOptions]::Singleline)
    
    foreach ($match in $matches) {
        $imgUrl = $match.Groups[1].Value
        $name = $match.Groups[2].Value -replace "<[^>]+>", "" # Remove any nested tags
        $name = $name.Trim()
        
        $fileName = Split-Path $imgUrl -Leaf
        if ($fileName.Contains("?")) { $fileName = $fileName.Split("?")[0] }

        if ($imgUrl -match "Fotograflar_tr" -and $name -ne "") {
            $mapping += [PSCustomObject]@{
                Name = $name
                Logo = $fileName
            }
        }
    }
}

$mapping | ConvertTo-Json | Out-File "d:\antigravity\osstss\institution_mapping.json"
Write-Host "Mapping saved to institution_mapping.json"
