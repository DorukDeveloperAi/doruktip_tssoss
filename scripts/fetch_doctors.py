import requests
import json
import os

def fetch_doctors():
    url = "https://doruktip.com/doktor_json.php"
    output_path = "src/data/new_doctors.json"
    
    # Ensure the directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    try:
        print(f"Fetching doctor data from {url}...")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        raw_data = response.json()
        print(f"Successfully fetched {len(raw_data)} records.")
        
        doctors = []
        for item in raw_data:
            doctor = {
                "title": item.get("title"),
                "name": item.get("name"),
                "hosp": item.get("hosp"),
                "unit_name": item.get("unit_name"),
                "link": item.get("link"),
                "fotograf_url": item.get("fotograf_url")
            }
            doctors.append(doctor)

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(doctors, f, indent=2, ensure_ascii=False)
            
        print(f"Filtered data saved to {output_path}")
        
    except Exception as e:
        print(f"Error fetching doctor data: {e}")

if __name__ == "__main__":
    fetch_doctors()
