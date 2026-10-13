# Recalcula la huella SHA-256 del <script> inline de index.html y la pone en la Content-Security-Policy.
# Ejecutar SIEMPRE después de cambiar el código y antes de publicar:  python3 tools/csp.py
import re,hashlib,base64,pathlib
p=pathlib.Path(__file__).resolve().parent.parent/'index.html'
s=p.read_text(encoding='utf-8')
scripts=re.findall(r'<script>(.*?)</script>',s,re.S)
assert len(scripts)==1,'Debe haber un único <script> inline'
h='sha256-'+base64.b64encode(hashlib.sha256(scripts[0].encode('utf-8')).digest()).decode()
s2,n=re.subn(r"'sha256-[A-Za-z0-9+/=]+'|'sha256-PENDIENTE'",f"'{h}'",s,count=1)
assert n==1,'No se encontró la huella en la CSP'
p.write_text(s2,encoding='utf-8');print('CSP actualizada:',h)
