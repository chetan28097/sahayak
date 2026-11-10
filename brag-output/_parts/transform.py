import re
s=open('index.v1.html',encoding='utf8').read()
def m(t):
    if t<10.2: return t
    if t<14.4: return t+9.2
    if t<23.4: return t+25.4
    if t<32.2: return t+38.2
    return t+48.2
head,rest=s.split('<script>\n      const tl',1)
script='<script>\n      const tl'+rest
def sub(g):
    v=float(g.group(1))
    if v<10.2: return g.group(1)
    return f"{m(v):.2f}".rstrip('0').rstrip('.')
script=re.sub(r'(?<![\w#.])(\d+\.\d+)(?![\w])',sub,script)
reps=[('{ opacity: 0, y: -30, duration: 0.35, ease: "power2.in" }, 9.85','{ opacity: 0, y: -30, duration: 0.35, ease: "power2.in" }, 10.85'),
('{ opacity: 1, y: 0, duration: 0.4, ease: E }, 6.55);','{ opacity: 1, y: 0, duration: 0.4, ease: E }, 6.0);'),
('{ opacity: 1, y: 0, duration: 0.4, ease: E }, 7.55);','{ opacity: 1, y: 0, duration: 0.4, ease: E }, 8.55);'),
('{ opacity: 1, y: 0, duration: 0.4, ease: E }, 8.45);','{ opacity: 1, y: 0, duration: 0.4, ease: E }, 9.4);'),
('"#s6 .center", { opacity: 0, scale: 0.96, duration: 0.3, ease: "power2.in" }, 70.1','"#s6 .center", { opacity: 0, scale: 0.96, duration: 0.3, ease: "power2.in" }, 70.9')]
for a,b in reps:
    assert a in script, a; script=script.replace(a,b)
script=script.replace('      window.__timelines["main"] = tl;',open('new.js',encoding='utf8').read()+'\n      window.__timelines["main"] = tl;')
for old,new in [('id="s2" class="clip" data-start="4.6" data-duration="5.6"','id="s2" class="clip" data-start="4.6" data-duration="6.6"'),
 ('id="s3" class="clip" data-start="10.2"','id="s3" class="clip" data-start="19.4"'),
 ('id="s4" class="clip" data-start="14.4"','id="s4" class="clip" data-start="39.8"'),
 ('id="s5" class="clip" data-start="23.4"','id="s5" class="clip" data-start="61.6"'),
 ('id="s6" class="clip" data-start="27.6" data-duration="4.6"','id="s6" class="clip" data-start="65.8" data-duration="5.4"'),
 ('id="s7" class="clip" data-start="32.2"','id="s7" class="clip" data-start="80.4"'),
 ('data-duration="38"','data-duration="86.2"')]:
    assert old in head, old; head=head.replace(old,new)
a0=head.index('      <!-- Audio: voiceover -->'); a1=head.index('    </div>\n\n',a0)
head=head[:a0]+open('audio.html',encoding='utf8').read()+head[a1:]
NEW=open('scenes.html',encoding='utf8').read().split('<!--SPLIT-->')
for marker,blk in [('      <!-- S3 Real Gnani voice -->',NEW[0]),('      <!-- S4 The flow -->',NEW[1]),('      <!-- S5 Slip + QR -->',NEW[2]),('      <!-- S7 Outro -->',NEW[3])]:
    assert marker in head, marker; head=head.replace(marker,blk.strip('\n')+'\n\n'+marker)
head=head.replace('    </style>',open('new.css',encoding='utf8').read()+'    </style>')
open('index.html','w',encoding='utf8').write(head+script)
print('ok')
