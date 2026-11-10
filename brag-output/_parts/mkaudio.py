import json
vo=[("v1",0.3,4.16),("v2",4.7,6.16),("va",11.4,7.76),("vb",23.8,15.76),("v3",40.0,7.76),("vc",49.0,12.56),("v4",61.7,4.16),("v5",66.0,5.12),("vd",71.4,8.96),("v6",80.6,4.64)]
L=["      <!-- Audio: voiceover (all Gnani Timbre TTS, voice Shivani) -->"]
for i,(k,s,d) in enumerate(vo):
    L.append(f'      <audio id="vo-{k}" data-start="{s}" data-duration="{d}" data-track-index="{3 if i%2==0 else 5}" data-volume="1" src="assets/vo/g_{k}.wav"></audio>')
L.append('      <audio id="gnani" data-start="19.6" data-duration="3.7" data-track-index="4" data-volume="1" src="assets/vo/gnani-kn-greet.wav"></audio>')
pts=[(0,0.42),(0.3,0.15),(19.4,0.15),(19.6,0.07),(23.3,0.07),(23.6,0.15),(85.2,0.15),(85.5,0.4),(86.2,0)]
auto=json.dumps({"version":1,"lanes":[{"target":"volume","points":[{"t":t,"v":v} for t,v in pts]}]})
L.append('      <audio id="music" data-start="0" data-duration="86.2" data-track-index="10" data-volume="1" src="assets/music/happy-beats-business-moves-vol-1-by-ende-dot-app.mp3" data-automation=\''+auto+'\'></audio>')
sfx=[(2.25,"impact/impactPunch_heavy_000.ogg",0.75,1.2),(4.75,"impact/impactBell_heavy_000.ogg",0.8,1.48),(6.0,"interface/drop_001.ogg",0.6,0.4),(8.55,"interface/drop_002.ogg",0.6,0.4),(9.4,"interface/drop_001.ogg",0.6,0.4),
(14.15,"interface/drop_002.ogg",0.6,0.4),(15.3,"interface/drop_001.ogg",0.6,0.4),(16.95,"interface/drop_002.ogg",0.6,0.4),(19.45,"interface/click_002.ogg",0.7,0.2),
(25.55,"interface/drop_001.ogg",0.6,0.4),(26.85,"interface/drop_002.ogg",0.6,0.4),(28.25,"interface/drop_001.ogg",0.6,0.4),(33.65,"interface/drop_002.ogg",0.6,0.4),(36.05,"interface/drop_001.ogg",0.6,0.4),
(39.85,"impact/impactSoft_medium_001.ogg",0.7,0.8),(47.1,"impact/impactBell_heavy_000.ogg",0.65,1.48),(51.45,"interface/switch_002.ogg",0.7,0.6),(54.65,"interface/switch_002.ogg",0.7,0.6),(56.55,"interface/switch_002.ogg",0.7,0.6),
(61.65,"impact/impactSoft_medium_003.ogg",0.7,0.8),(66.8,"interface/switch_002.ogg",0.7,0.6),(67.6,"interface/switch_002.ogg",0.7,0.6),(68.4,"interface/switch_002.ogg",0.7,0.6),
(72.9,"interface/drop_001.ogg",0.6,0.4),(74.45,"interface/drop_002.ogg",0.6,0.4),(77.05,"interface/drop_001.ogg",0.6,0.4),(80.5,"impact/impactBell_heavy_000.ogg",0.85,1.48)]
L.append("      <!-- Audio: SFX -->")
for i,(s,f,v,d) in enumerate(sfx):
    L.append(f'      <audio id="sfx-{i}" data-start="{s}" data-duration="{d}" data-track-index="{11+i%3}" data-volume="{v}" src="assets/sfx/{f}"></audio>')
open('audio.html','w',encoding='utf8').write("\n".join(L)+"\n")
