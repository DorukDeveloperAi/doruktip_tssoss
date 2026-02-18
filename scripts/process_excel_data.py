import json
import os
import re

def process_doctors():
    raw_list = """
VOLKAN DALLI	ACİL	TSS	
OĞUZHAN ÇANAKÇI	ACİL	TSS	
KUTAY ŞENTAY	ACİL	TSS	
MUHAMMED MUHTAR ÖZSOY	ACİL	TSS	
FURKAN EREN	ACİL	TSS	
ABDULLAH HOŞER	ACİL	TSS	
SAİD AHMET MUTLU	ACİL	TSS	
KAYHAN SELÇUK	ACİL	TSS	
HALİL ERKAN SAYAN	ANESTEZİ	TSS	
PROF DR AYTAÇ YÜCEL	ANESTEZİ	TSS	
UMUT ÖYLEVİ	ANESTEZİ	TSS	
SERVET DEMİR 	ANESTEZİ	TSS	
ÖZLEM ÖZKUMİT	ANESTEZİ	TSS	
ATIF MUTLU	BEYİN CERRAHİSİ	TSS	
MESUT ÇELİK	BEYİN CERRAHİSİ	TSS	
GÜLSEVEN KILIÇLI	BİYOKİMYA	TSS	
NEJAT BIYIKLI	CİLDİYE	TSS	
PROF.DR DENİZ SEÇKİN	CİLDİYE	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
FATİH GÖK	ÇOCUK	TSS	
ABDULKADİR GÖĞREMİŞ	ÇOCUK	TSS	
BURAK DANACIOĞLU	ÇOCUK	TSS	
SUAT PAKER	ÇOCUK	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
AHMET TURGUT	ÇOCUK	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
TAMER ÖZEKİNCİ	ÇOCUK CERRAHİ	TSS	
FİLİZ TATLISÖZ	ÇOCUK CERRAHİ	TSS	
ÖMER SELİM YILMAZ	DAHİLİYE	TSS	
MEHMET RENAN ÖZAKGÜN	DAHİLİYE	TSS	
SEREN ŞEVİKER	DAHİLİYE	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
MELTEM ÖNER KARAÇAY	ENFEKSİYON	TSS	
ELİF AKSAKALLI	FTR	TSS	
PRF.ŞÜHEDA ÖZÇAKIR	FTR	TSS	
NACİ YOSUNKAYA	FTR	TSS	
FATİH SERKAN YEĞEN	G CERR	TSS	
İLHAN AYDIN	GENEL CERRAHİ	TSS	
DOÇ DR VOLKAN TÜMAY	G CERR	TSS	
DOÇ.DR ÖMER YALKIN	G CERR	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
COŞKUN ÖZER	G CERR	TSS	
METE ŞİŞMAN	G CERR	TSS	
SALİH KILIÇ	GASTROENTOLOJİ	TSS	
MURAT PEKGÖZ	GASTROENTOLOJİ	TSS	
KAMRAN ALİYEV	GÖĞÜS CERRAHİSİ	TSS	
İRFAN ATASOY	GÖĞÜS HASTALIKLARI	TSS	
ALİ KARATAŞ	GÖZ	TSS	
FERAY ALGÜN ALKAN	GÖZ	TSS	
BAYRAM ÇALIŞKAN	GÖZ	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
HASAN VATANSEVER	GÖZ	TSS	
ZAFER YEĞEN	HEMATOLOJİ	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
ERKAN AVCI	KARDİYOLOJİ	TSS	
AHMET SEÇKİN ÇETİNKAYA	KARDİYOLOJİ	TSS	
PRF.MEHMET VEDAT KOCA	KARDİYOLOJİ	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
EMİN ÖZTÜRK	KBB	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
ŞENOL ACAR	KBB	TSS	
CEM HIZLI	KBB	TSS	
DOÇ.DR.NESİBE ASLIER	KBB	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
DOÇ DR MEHMET BAYRAK	KHD	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
FATMA GÜRAY	KHD	TSS	
AYŞENUR KAYA	KHD	TSS	
ELİF ŞAHİN	KHD	TSS	
MUTLU KİLCİLER	KHD	TSS	
KEMAL KÖROĞLU	KHD	TSS	
MERVE KAHRAMAN	KHD	TSS	
SÜHENDAN BENDERLİ	KHD	TSS	
ELİF NUR SEVİNÇ	KHD	TSS	
EBRU SÜER	KHD	TSS	
FEYZA BAYRAM	KHD	TSS	
MELİKE YILDIRIM	KHD	TSS	
PROF.DR OSMAN TİRYAKİOĞLU	KVC	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
SİNAN DEMİRTAŞ	KVC	TSS	
SEVAL ÖZDEMİR	MİKROBİYOLOJİ	TSS	
FİLİZ GÖZETEN YETİKER	NÖROLOJİ	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
PRF.DR İBRAHİM HAKKI BORA	NÖROLOJİ	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
ÇİĞDEM ŞEN	NÖROLOJİ	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
TOMRİS ATABEY	NÜKLEER TIP	TSS	
DOÇ.DR TURGUT KAÇAN	TIBBİ ONKOLOJİ	TSS	
MUSTAFA ESGİN	ORTOPEDİ	TSS	
NOURALDIN JA KHAROUSHA	ORTOPEDİ	TSS	
TAYFUN AÇIKGÖZ	ORTOPEDİ	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
ÖZGÜR TEMİZ	ORTOPEDİ	TSS	
ÖMER YAVUZ	ORTOPEDİ	TSS	
GÜNGÖR ERK	ORTOPEDİ	TSS	
CAHİT KOÇAK	ORTOPEDİ	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
FURKAN KARABULUT	PLASTİK CERRAHİ	TSS	
MURAT KAAN SÖZERİ	PLASTİK CERRAHİ	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
KEMAL KARACA	PLASTİK CERRAHİ	TSS	
FATMA ERZENGİN	PSİKİYATRİ	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
AHMET HAKKI AŞIK	PSİKİYATRİ	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
NİHAT SÖZER	RADYASYON ONK	TSS	
ELFİ DİVANLI	RADYOLOJİ	TSS	
SELMAN CANDAN	RADYOLOJİ	TSS	
DOÇ DR MEHMET ALİ KARAGÖZ	ÜROLOJİ	TSS	
KADİR ÖMÜR GÜNSEREN	ÜROLOJİ	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
TUNCAY ÖZGÜNAY	ÜROLOJİ	TSS	
TUĞRUL TÜRKER	ÜROLOJİ	TSS	
HÜSEYİN TATAR	YDYB	TSS	
HANİFE ZERRİN YAZICI ÖZTÜRK	DERMATOLOJİ	TSS	
PRF DR HACI MURAT ÇAYCI	GENEL CERRAHİ	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
AHMET DEMİR	KULAK BURUN BOĞAZ	TSS	
MURAT ALBAS	NÖROLOJİ	TSS	
DOÇ.DR İRFAN ESEN	DAHİLİYE	TSS	
DOÇ.DR SELİN AKTÜRK ESEN	TIBBİ ONKOLOJİ	TSS	
ALİ ARTUNÇ ELLERGEZEN	RADYOLOJİ	TSS	
İBRAHİM BARAN	KARDİYOLOJİ	TSS	ANLAŞMALI OLARAK TEKRAR DÜZENLENDİ
""".strip()

    new_doctors_path = "src/data/new_doctors.json"
    excel_doktor_path = "src/data/tss_doktor.json"

    with open(new_doctors_path, 'r', encoding='utf-8') as f:
        api_data = json.load(f)

    def turkish_slug(text):
        if not text: return ""
        text = text.lower()
        mapping = {
            'ı': 'i', 'İ': 'i', 'ş': 's', 'Ş': 's', 'ç': 'c', 'Ç': 'c',
            'ğ': 'g', 'Ğ': 'g', 'ü': 'u', 'Ü': 'u', 'ö': 'o', 'Ö': 'o'
        }
        for k, v in mapping.items():
            text = text.replace(k, v)
        # Remove titles
        text = re.sub(r'^(prof\.?\s*dr\.?|op\.?\s*dr\.?|uzm\.?\s*dr\.?|dt\.?|doc\.?\s*dr\.?|dr\.?|prf\.?|dyt\.?|psk\.?)\s*', '', text)
        # Remove non-alphanumeric except spaces
        text = re.sub(r'[^a-z0-9\s]', '', text)
        return " ".join(text.split())

    def get_slug_words(slug):
        return set(slug.split())

    # Map API data by slug and store slug info
    api_entries = []
    for d in api_data:
        slug = turkish_slug(d['name'])
        api_entries.append({
            'data': d,
            'slug': slug,
            'words': get_slug_words(slug)
        })

    result = []
    lines = [line.strip() for line in raw_list.split('\n') if line.strip()]
    
    for line in lines:
        parts = line.split('\t')
        name_with_title = parts[0].strip()
        slug = turkish_slug(name_with_title)
        words = get_slug_words(slug)
        
        updated = len(parts) > 3 and "TEKRAR DÜZENLENDİ" in parts[3]
        
        match = None
        
        # 1. Exact slug match
        for entry in api_entries:
            if entry['slug'] == slug:
                match = entry['data']
                break
        
        # 2. Substring match
        if not match:
            for entry in api_entries:
                if slug in entry['slug'] or entry['slug'] in slug:
                    match = entry['data']
                    break
        
        # 3. Word intersection match
        if not match and len(words) > 0:
            for entry in api_entries:
                intersection = words.intersection(entry['words'])
                if len(words) >= 2 and len(intersection) >= 2:
                    match = entry['data']
                    break
                elif len(words) == 1 and len(intersection) == 1:
                    match = entry['data']
                    break

        # 4. Special manual override
        if not match:
            manual_map = {
                "abdullah hoser": "abdullah hosher",
                "haci murat cayci": "haci murat cayici",
                "zafer yegen": "zafer serenli yegen",
                "fatih serkan yegen": "serkan fatih yegen",
                "nesibe aslier": "nesibe gul yuksel aslier",
            }
            if slug in manual_map:
                target_slug = manual_map[slug]
                for entry in api_entries:
                    if entry['slug'] == target_slug:
                        match = entry['data']
                        break

        if match:
            doc_entry = match.copy()
            if updated:
                doc_entry["updated"] = True
            result.append(doc_entry)
        else:
            result.append({
                "title": "",
                "name": name_with_title,
                "hosp": "Bilinmiyor",
                "unit_name": parts[1] if len(parts) > 1 else "",
                "link": "",
                "fotograf_url": None,
                "updated": updated
            })

    with open(excel_doktor_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"Successfully processed {len(result)} doctors and saved to {excel_doktor_path}")

if __name__ == "__main__":
    process_doctors()
