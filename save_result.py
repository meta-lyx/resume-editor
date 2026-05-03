import urllib.request, json, sys, time, os

def req(method, path, body=None, token=None):
    data = json.dumps(body).encode() if body else None
    h = {"Content-Type": "application/json"}
    if token: h["Authorization"] = "Bearer " + token
    r = urllib.request.Request("http://127.0.0.1:8787" + path, data=data, headers=h, method=method)
    try:
        resp = urllib.request.urlopen(r, timeout=120)
        return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try: return e.code, json.loads(body)
        except: return e.code, body

email = "u" + str(int(time.time()*1000)) + "@x.com"
s, b = req("POST", "/api/auth/register", {"email": email, "password": "test123", "name": "Dev"})
if s != 200: print("Register failed:", s, b); sys.exit(1)
token = b["session"]["token"]
print("Registered")

resumeContent = """Software Engineer with 5 years of experience in full-stack development, specializing in Python and JavaScript.

PROFESSIONAL EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2020-Present
- Led a team of 5 engineers to build a microservices architecture serving 1M+ users
- Designed and implemented RESTful APIs using Python (FastAPI) and PostgreSQL
- Reduced deployment time by 60% through CI/CD automation with Docker and GitHub Actions

Software Engineer | StartUpX | 2018-2020
- Built real-time data processing pipeline handling 100K events/second
- Developed React-based dashboard with TypeScript and Redux
- Implemented automated testing achieving 95% code coverage

Junior Developer | WebAgency | 2016-2018
- Developed responsive web applications using React and Node.js
- Built REST APIs with Express.js and MongoDB

EDUCATION
B.S. Computer Science | State University | 2012-2016

SKILLS
Languages: Python, JavaScript, TypeScript, SQL
Frameworks: React, Node.js, FastAPI, Express.js
Cloud: AWS (ECS, RDS, Lambda, S3), Docker, Kubernetes"""

jobDescription = """Senior Software Engineer - AI Platform
Looking for a senior software engineer to join our AI platform team.
Requirements: 5+ years experience, Python/TypeScript, cloud (AWS), scalable distributed systems, AI/ML infrastructure a plus."""

print("Calling AI...")
start = time.time()
s, b = req("POST", "/api/ai/optimize", {
    "resumeContent": resumeContent,
    "jobDescription": jobDescription,
    "optimizationType": "job-match",
    "model": "deepseek-chat"
}, token=token)
elapsed = time.time() - start

if s == 200:
    result = b.get("optimizedContent", "")
    desktop = os.path.expanduser("~/Desktop")
    outpath = os.path.join(desktop, "ai_result_deepseek.txt")
    with open(outpath, "w", encoding="utf-8") as f:
        f.write(result)
    print(f"OK - {elapsed:.1f}s, {len(result)} chars")
    print(f"Saved to: {outpath}")
else:
    print(f"FAIL ({s}):", json.dumps(b, indent=2)[:600])
