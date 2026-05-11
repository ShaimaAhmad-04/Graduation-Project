import subprocess
import os


base = os.path.dirname(os.path.abspath(__file__))
node_path = os.path.join(base,"NodeJS")
python_path= os.path.join(base,"Python")
frontend_path = os.path.join(base, "Frontend")


python_server = subprocess.Popen(
    ["uvicorn", "main:app", "--reload", "--port", "8000"],
    cwd=python_path
)

node_server = subprocess.Popen(
  ["npm","run","dev"],
  cwd = node_path,
  shell=True
)

angular_server = subprocess.Popen(
    ["ng", "serve"],
    cwd=frontend_path,
    shell=True
)
print("✅ All servers started!")
print("   Python API  → http://localhost:8000")
print("   Node.js API → http://localhost:5002")
print("   Angular     → http://localhost:4200")
# Keep running until Ctrl+C
try:
    python_server.wait()
except KeyboardInterrupt:
    print("\n🛑 Shutting down all servers...")
    python_server.terminate()
    node_server.terminate()
    angular_server.terminate()
