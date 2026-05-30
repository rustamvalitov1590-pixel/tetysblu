import http.server
import socketserver
import os

PORT = 8080
os.chdir('c:\\Users\\rusta\\.antigravity\\aktau-tourists\\tetis-blue-calc')
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("Serving at port", PORT)
    httpd.serve_forever()
