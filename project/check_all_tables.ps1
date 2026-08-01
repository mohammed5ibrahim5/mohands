$anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwa3pybXZkemRjeGNkenZ2YXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzIxOTEsImV4cCI6MjEwMTE0ODE5MX0.xTYPy75bkXCtRVnksa4uCxyUvRn0O4K3tIW2vttNgj8'
$base = 'https://ipkzrmvdzdcxcdzvvatl.supabase.co/rest/v1'

$tables = @('categories', 'products', 'orders', 'order_items', 'reviews', 'wishlist', 'product_images', 'profiles')
foreach ($t in $tables) {
  try {
    $uri = "$base/$t?select=*&limit=3"
    $r = Invoke-RestMethod -Uri $uri -Headers @{ apikey = $anonKey; Authorization = "Bearer $anonKey" } -Method Get
    Write-Host "$t : EXISTS ($($r.Count) rows)"
    if ($r.Count -gt 0) { Write-Host "  Sample: $($r[0] | ConvertTo-Json -Compress)" }
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    $msg = $_.Exception.Message
    Write-Host "$t : MISSING (HTTP $code) - $msg"
  }
}

