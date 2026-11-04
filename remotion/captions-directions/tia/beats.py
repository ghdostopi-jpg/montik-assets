import json
W=[["Koliko",0.39,0.69],["krem",0.81,0.99],["in",1.05,1.11],["serumov",1.17,1.53],["si",1.59,1.65],["že",1.71,1.77],["preizkusila,",1.89,2.43],["pa",2.49,2.55],["še",2.61,2.67],["vedno",2.73,2.91],["čakaš",2.97,3.45],["na",3.45,3.51],["tisti",3.57,3.83],["wow",3.87,4.17],["efekt?",4.35,4.59],["Kaj",5.55,5.67],["pa,",5.79,5.91],["če",5.97,6.09],["spremeniš",6.09,6.45],["tudi",6.57,6.63],["način",6.81,6.99],["nanašanja?",7.11,7.71],["To",9.39,9.45],["je",9.51,9.57],["Biostile",9.81,10.29],["MicroInfusion",10.41,11.13],["set",11.31,11.37],["z",11.55,11.61],["mikroigličnim",11.67,12.39],["aplikatorjem",12.51,13.11],["in",13.17,13.23],["serumom",13.41,13.77],["s",13.89,13.95],["Chronoglowom,",14.01,14.61],["peptidi",14.79,15.27],["ter",15.33,15.39],["hialuronsko",15.57,16.17],["kislino.",16.29,16.71],["Posebnost",17.85,18.21],["aplikatorja",18.39,18.93],["je,",19.05,19.23],["da",19.29,19.35],["z",19.41,19.47],["nežnim",19.53,19.83],["pritiskanjem",19.95,20.43],["ustvari",20.61,20.91],["drobne",21.03,21.33],["mikrokanale,",21.51,22.23],["ki",22.29,22.35],["omogočajo",22.47,22.89],["globlje",23.07,23.37],["prodiranje",23.49,23.91],["seruma.",24.03,24.45],["Za",25.77,25.83],["bolj",25.95,26.07],["gladek,",26.19,26.55],["čvrst",26.67,26.97],["in",27.03,27.09],["sijoč",27.27,27.57],["videz",27.63,27.87],["kože,",27.99,28.23],["kar",28.35,28.41],["doma.",28.53,28.71]]
def tl(s):  # source -> timeline after the three dead-air trims
    if s < 7.92: return s
    if s < 16.95: return s-0.93
    if s < 24.78: return s-1.43
    return s-2.03
T=[[w,round(tl(a),3),round(tl(b),3)] for w,a,b in W]
def ws(a,b,start): return [[w,round(s-start,3),round(e-start,3)] for w,s,e in T if s>=a-0.001 and s<b]
beats=[]
def add(name,a,b,cfg): cfg=dict(cfg); cfg.setdefault('words',ws(a,b,a)); beats.append({'name':name,'start':a,'dur':round(b-a,3),'cfg':cfg})
add('Hook stomp',0.25,2.47,dict(mode='stomp',keys=['krem','serumov'],tone='ink',x=210,w=660,y=480,size=110,lines=[2,2,3]))
add('Hook dynamic',2.47,5.42,dict(mode='dynamic',keys=['wow'],tone='ink',y=440,size=78))
add('Question boxes',5.42,7.92,dict(mode='box',keys=['nanašanja'],y=450,size=60))
add('Product title',8.0,10.6,dict(mode='title',title='MicroInfusion Set',kicker='Biostile',s=0.3,tone='ink',y=430,size=88,words=[]))
add('Applicator + serum marker',10.6,13.86,dict(mode='marker',keys=['mikroigličnim','chronoglowom'],tone='ink',y=430,size=64))
add('Ingredient stack',13.86,16.0,dict(mode='stack',tone='cream',x=90,w=660,y=1160,anchor='top',align='left',size=56,
    items=[['Chronoglow®',0.04,1],['peptidi',0.14],['hialuronska kislina',0.78]],words=[]))
add('Applicator editorial',16.0,19.58,dict(mode='editorial',keys=['posebnost','nežnim'],tone='ink',y=440,size=46))
add('Microchannels 3D',19.58,23.7,dict(mode='tilt',plate=True,keys=['mikrokanale','globlje'],x=400,w=500,y=700,anchor='top',align='right',size=54))
add('Benefits editorial',23.7,26.25,dict(mode='editorial',keys=['gladek','čvrst','sijoč'],tone='ink',y=400,size=46))
json.dump({'words':T,'beats':beats},open('beats.json','w'),ensure_ascii=False,indent=1)
for b in beats: print(b['name'],b['start'],b['dur'],[w[0] for w in b['cfg']['words']])
print('kar doma', [w for w in T if w[0] in ('kar','doma.')])
