param(
    [Parameter(Mandatory=$false)]
    [string]$InputFile = "Solitude Machine.mp4",

    [Parameter(Mandatory=$false)]
    [string]$OutputFile = "Solitude Machine_compressed.mp4",

    # CRF (Constant Rate Factor): Lower is higher quality, higher is more compression.
    # 28 is standard for H.265. 30-32 is good for very small files.
    [Parameter(Mandatory=$false)]
    [int]$CRF = 30,

    # Preset: slower = better compression (smaller file for same quality), but takes longer to encode.
    [Parameter(Mandatory=$false)]
    [string]$Preset = "slower"
)

# Check if input file exists
if (-not (Test-Path $InputFile)) {
    Write-Host "Error: Input file '$InputFile' not found." -ForegroundColor Red
    Write-Host "Usage: .\compress-video.ps1 -InputFile 'myfile.mp4' -CRF 30"
    exit 1
}

Write-Host "Compressing '$InputFile' using H.265 (HEVC)..." -ForegroundColor Cyan
Write-Host "Settings: CRF=$CRF, Preset=$Preset" -ForegroundColor Gray

# Run ffmpeg
# -vcodec libx265: Use H.265 codec
# -crf: Quality setting (higher = smaller)
# -preset: Encoding speed/efficiency tradeoff
# -tag:v hvc1: Ensures compatibility with Apple devices (macOS/iOS)
# -acodec aac -b:a 128k: Compress audio to AAC at 128kbps
ffmpeg -i $InputFile `
    -vcodec libx265 `
    -crf $CRF `
    -preset $Preset `
    -tag:v hvc1 `
    -acodec aac `
    -b:a 128k `
    $OutputFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSuccess! Compressed file saved as: $OutputFile" -ForegroundColor Green
    $oldSize = (Get-Item $InputFile).Length / 1MB
    $newSize = (Get-Item $OutputFile).Length / 1MB
    Write-Host ("Original Size: {0:N2} MB" -f $oldSize)
    Write-Host ("New Size:      {0:N2} MB" -f $newSize)
    Write-Host ("Reduction:     {0:P2}" -f (1 - ($newSize / $oldSize)))
} else {
    Write-Host "`nFFmpeg failed with exit code $LASTEXITCODE" -ForegroundColor Red
}
