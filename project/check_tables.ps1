$headers = @{
  apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwa3pybXZkemRjeGNkenZ2YXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzIxOTEsImV4cCI6MjEwMTE0ODE5MX0.xTYPy75bkXCtRVnksa4uCxyUvRn0O4K3tIW2vttNgj8'
  Authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwa3pybXZkemRjeGNkenZ2YXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzIxOTEsImV4cCI6MjEwMTE0ODE5MX0.xTYPy75bkXCtRVnksa4uCxyUvRn0O4K3tIW2vttNgj8'
}
$tables = @('categories', 'products', 'orders', 'order_items', 'reviews', 'wishlist', 'product_images', 'profiles')
foreach ($t in $tables) {
  try {
    $uri = "https://ipkzrmvdzdcxcdzvvatl.supabase.co/rest/v1/$t?select=id&limit=1"
    $r = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get
    Write-Host "$t : EXISTS ($($r.Count) rows)"
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Host "$t : MISSING (HTTP $code)"
  }
}

