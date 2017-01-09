#! /usr/bin/env python3
import http.server
import socketserver

class MySimpleHTTPHandler( http.server.SimpleHTTPRequestHandler ):
     def send_head(self):
          self.send_header("Access-Control-Allow-Origin", "*")
          super.send_head(self)

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler
httpd = socketserver.TCPServer(("", PORT), Handler)
print("serving at port", PORT)
httpd.serve_forever()
