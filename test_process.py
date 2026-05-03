import urllib.request
import json
import sys

def req(method, path, body=None, token=None):
    data = json.dumps(body).encode() if body else None
    h = {"Content-Type": "application/json"}
    if token:
        h["Authorization"] = "Bearer " + token
    r = urllib.request.Request("http://localhost:8787" + path, data=data, headers=h, method=method)
    try:
        resp = urllib.request.urlopen(r, timeout=60)
        return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            return e.code, json.loads(body)
        except:
            return e.code, body
    except Exception as e:
        return 0, str(e)

# Login
s, b = req("POST", "/api/auth/login", {"email": "alice@example.com", "password": "password123"})
if s != 200:
    print("Login FAILED:", s, b)
    sys.exit(1)
token = b["session"]["token"]
print("Login OK")

# Test process-resume with real resume content
resume = """Software Engineer with 5 years of experience in full-stack development, specializing in Python and JavaScript.

PROFESSIONAL EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2020-Present
- Led a team of 5 engineers to build a microservices architecture serving 1M+ users
- Designed and implemented RESTful APIs using Python (FastAPI) and PostgreSQL
- Reduced deployment time by 60% through CI/CD automation with Docker and GitHub Actions

Software Engineer | StartUpX | 2018-2020
- Built real-time data processing pipeline handling 100K events/second
- Developed React-based dashboard with TypeScript and Redux
- Implemented automated testing achieving 95% code coverage

EDUCATION
B.S. Computer Science | State University | 2012-2016

SKILLS
Languages: Python, JavaScript, TypeScript, SQL
Frameworks: React, Node.js, FastAPI, Express.js
Cloud: AWS (ECS, RDS, Lambda, S3), Docker, Kubernetes"""

jd = """Senior Software Engineer - AI Platform

We're looking for a senior software engineer to join our AI platform team at InnovateAI. You will work on building and scaling the infrastructure behind our machine learning products.

Requirements:
- 5+ years of experience in software engineering
- Strong proficiency in Python and JavaScript/TypeScript
- Experience with cloud services (AWS or GCP)
- Experience building scalable distributed systems
- Familiarity with machine learning pipelines or AI infrastructure is a plus"""

print("Sending process-resume request...")
s, b = req("POST", "/api/ai/process-resume", {
    "resumeText": resume,
    "jobDescription": jd,
}, token=token)

print()
print("Status:", s)
if s == 200:
    print("Response keys:", list(b.keys()))
    if "result" in b and "customizedResume" in b["result"]:
        text = b["result"]["customizedResume"]
        print("customizedResume length:", len(text))
        print("customizedResume preview:", text[:200])
    else:
        print("Full response:", json.dumps(b, indent=2)[:600])
else:
    print("Response:", json.dumps(b, indent=2)[:400])
