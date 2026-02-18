import json
import os

def load_json(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: File not found at {filepath}")
        return []

def save_json(data, filepath):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Successfully saved {len(data)} records to {filepath}")

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    new_doctors_path = os.path.join(base_dir, 'src', 'data', 'new_doctors.json')
    tss_doctors_path = os.path.join(base_dir, 'src', 'data', 'tss_doktor.json')
    output_path = os.path.join(base_dir, 'src', 'data', 'doctors_data.json')

    print(f"Loading data from {new_doctors_path}...")
    all_doctors = load_json(new_doctors_path)
    
    print(f"Loading data from {tss_doctors_path}...")
    tss_doctors = load_json(tss_doctors_path)

    # Create a map for quick lookup of TSS/OSS doctors
    tss_map = {}
    for doc in tss_doctors:
        if 'name' in doc and doc['name']:
            normalized_name = doc['name'].strip().upper()
            tss_map[normalized_name] = doc

    # Merge data
    merged_data = []
    print("Merging data...")
    
    for doc in all_doctors:
        if 'name' not in doc or not doc['name']:
            continue
            
        normalized_name = doc['name'].strip().upper()
        
        # Enriched doctor object
        enriched_doc = doc.copy()
        
        # Check against TSS map
        if normalized_name in tss_map:
            tss_info = tss_map[normalized_name]
            enriched_doc['tss_agreement'] = True
            enriched_doc['tss_new'] = tss_info.get('updated', False) is True
        else:
            enriched_doc['tss_agreement'] = False
            enriched_doc['tss_new'] = False
            
        merged_data.append(enriched_doc)

    # Save merged data
    save_json(merged_data, output_path)
    print("Merge complete.")

if __name__ == "__main__":
    main()
