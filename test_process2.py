import urllib.request
import json

def req(method, path, body=None, token=None):
    data = json.dumps(body).encode() if body else None
    h = {"Content-Type": "application/json"}
    if token:
        h["Authorization"] = "Bearer " + token
    r = urllib.request.Request("http://localhost:8787" + path, data=data, headers=h, method=method)
    try:
        resp = urllib.request.urlopen(r, timeout=120)
        return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())
    except Exception as e:
        return 0, str(e)

# Login
s, b = req("POST", "/api/auth/login", {"email": "alice@example.com", "password": "password123"})
if s != 200:
    print("Login FAILED:", s, b)
    exit(1)
token = b["session"]["token"]
print("Login OK")

# Test with a simple resume that has a clear name
resume = """LI XIAOMING
Software Engineer
xiaoming@email.com | +86-138-0000-0000

SUMMARY
Experienced software engineer with 4 years building web applications.

EXPERIENCE
Software Engineer | ABC Tech | 2021-2024
- Built REST APIs with Python and FastAPI
- Developed React frontend components
- Deployed applications on AWS

EDUCATION
B.S. Computer Science | Peking University | 2017-2021

SKILLS
Python, JavaScript, React, AWS, Docker
"""

print("Sending process-resume with Li Xiaoming's resume...")
s, b = req("POST", "/api/ai/process-resume", {
    "resumeText": resume,
    "jobDescription": "Looking for a software engineer with Python and React experience.",
}, token=token)

print("Status:", s)
if s == 200:
    r = b.get("result", {})
    print("Has customizedResume:", bool(r.get("customizedResume")))
    print("Has structuredResume:", bool(r.get("structuredResume")))
    sr = r.get("structuredResume", {})
    if sr:
        print("Name from structuredResume:", sr.get("personalInfo", {}).get("name"))
        print("Experience count:", len(sr.get("experience", [])))
        print("Skills count:", len(sr.get("skills", [])))
    else:
        print("structuredResume is null!")
        print("Keys in result:", list(r.keys()))
else:
    print("Error:", json.dumps(b, indent=2)[:400])
