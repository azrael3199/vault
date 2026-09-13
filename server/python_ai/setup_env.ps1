$ErrorActionPreference = "Stop"
cd $PSScriptRoot

Write-Host "Creating Python virtual environment..."
python -m venv venv

Write-Host "Activating venv and upgrading pip..."
& .\venv\Scripts\python.exe -m pip install --upgrade pip

Write-Host "Installing PyTorch (CPU) and AI dependencies..."
# Use CPU wheels to drastically reduce download size (~150MB instead of 2.5GB)
& .\venv\Scripts\pip.exe install torch --index-url https://download.pytorch.org/whl/cpu
& .\venv\Scripts\pip.exe install diffusers transformers accelerate pillow

Write-Host "Environment setup complete!"
