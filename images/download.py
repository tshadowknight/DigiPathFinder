import urllib.request
import urllib.parse
import re
import json

with open("imageData.json", 'r') as f:
   datastore = json.load(f)

for x in datastore:
   url = datastore[x]
   file_path = str(x) + ".png"
   print("Downloading " + url);
   urllib.request.urlretrieve (url, file_path)
   print(" -- Done! (" + file_path + ")");
   