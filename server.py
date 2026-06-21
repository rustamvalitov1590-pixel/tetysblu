import http.server
import socketserver
import os
import sys

PORT = 8080
Handler = http.server.SimpleHTTPRequestHandler

class MyHTTPRequestHandler(Handler):
    def end_headers(self):
        # Disable caching for development convenience
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def run_server():
    # Ensure we serve the directory of server.py
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Try starting the server on PORT, if busy, try port+1
    port = PORT
    while True:
        try:
            with socketserver.TCPServer(("", port), MyHTTPRequestHandler) as httpd:
                print(f"\n==================================================")
                print(f"  Tetys Blu Calculator is running at:")
                print(f"  http://localhost:{port}")
                print(f"==================================================\n")
                print("Press Ctrl+C to stop the server.\n")
                httpd.serve_forever()
        except OSError as e:
            if e.errno == 98 or e.errno == 10048: # Address already in use
                print(f"Port {port} is busy, trying port {port + 1}...")
                port += 1
            else:
                raise e
        except KeyboardInterrupt:
            print("\nServer stopped.")
            sys.exit(0)

if __name__ == '__main__':
    run_server()
