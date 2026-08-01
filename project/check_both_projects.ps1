$projects = @(
  @{ Name = 'ipkzrmvdzdcxcdzvvatl'; Url = 'https://ipkzrmvdzdcxcdzvvatl.supabase.co'; Key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwa3pybXZkemRjeGNkenZ2YXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzIxOTEsImV4cCI6MjEwMTE0ODE5MX0.xTYPy75bkXCtRVnksa4uCxyUvRn0O4K3tIW2vttNgj8' },
  @{ Name = 'grjbrhurvzzaerazsdsl'; Url = 'https://grjbrhurvzzaerazsdsl.supabase.co'; Key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyamJyaHVydnp6YWVyYXpzZHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NTYxNjUsImV4cCI6MjEwMTEzMjE2NX0.CfkgeDTFY360FMXShtO8s0PHJDX-5N1sgqa8ONgMRkI' }
)

foreach ($p in $projects) {
  Write-Host "=== Project: $($p.Name) ==="
  try {
    $uri = "$($p.Url)/rest/v1/categories?select=id&limit=3"
    $r = Invoke-RestMethod -Uri $uri -Headers @{ apikey = $p.Key; Authorization = "Bearer $($p.Key)" } -Method Get
    Write-Host "categories: EXISTS ($($r.Count) rows)"
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Host "categories: MISSING (HTTP $code)"
  }
  Write-Host ""
}

