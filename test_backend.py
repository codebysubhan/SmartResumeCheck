import requests

url = "http://localhost:5000/process-paths"
payload = {
    "jd_path": "Data/SALES_job_description.txt",
    "resume_folder": "Resumes_to_parse/data/SALES"
}

response = requests.post(url, json=payload)
print("Status Code:", response.status_code)

try:
    results = response.json().get("results", [])
    top = results[:20]
    for idx, item in enumerate(top, start=1):
        print(f"{idx}. {item['filename']}: {item['score']}")

except Exception as e:
    print("Response Text:", response.text)
    print("Error decoding JSON:", e)
