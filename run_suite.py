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

def register():
    email = "u" + str(int(time.time()*1000)) + "@x.com"
    s, b = req("POST", "/api/auth/register", {"email": email, "password": "test123", "name": "Tester"})
    if s != 200: raise Exception(f"Register failed: {s} {b}")
    return b["session"]["token"]

# Load test cases
with open(os.path.join(os.path.dirname(__file__), "test-suite.json"), "r", encoding="utf-8") as f:
    suite = json.load(f)

token = register()
desktop = os.path.expanduser("~/Desktop")
summary = []

for tc in suite["testCases"]:
    tc_id = tc["id"]
    print(f"\n{'='*60}")
    print(f"Running: {tc_id} - {tc['description']}")
    print(f"{'='*60}")
    
    start = time.time()
    s, b = req("POST", "/api/ai/optimize", {
        "resumeContent": tc["resumeText"],
        "jobDescription": tc["jobDescription"],
        "optimizationType": tc["optimizationType"],
        "model": "deepseek-chat"
    }, token=token)
    elapsed = time.time() - start
    
    if s == 200:
        result = b.get("optimizedContent", "")
        chars = len(result)
        model = b.get("model", "?")
        tokens = b.get("tokensUsed", "?")
        
        out = f"""=== {tc_id}: {tc['description']} ===
Status: OK | Time: {elapsed:.1f}s | Chars: {chars} | Model: {model} | Tokens: {tokens}

{result}

"""
        outpath = os.path.join(desktop, f"result_{tc_id}.txt")
        with open(outpath, "w", encoding="utf-8") as f:
            f.write(out)
        print(f"  OK - {elapsed:.1f}s, {chars} chars, saved to result_{tc_id}.txt")
        summary.append(f"[{tc_id}] OK - {elapsed:.1f}s, {chars} chars → result_{tc_id}.txt")
    else:
        outpath = os.path.join(desktop, f"result_{tc_id}.txt")
        with open(outpath, "w", encoding="utf-8") as f:
            f.write(f"=== {tc_id}: {tc['description']} ===\nFAIL ({s}): {json.dumps(b, indent=2)}")
        print(f"  FAIL ({s})")
        summary.append(f"[{tc_id}] FAIL ({s})")

# Write summary
summary_path = os.path.join(desktop, "test_summary.txt")
with open(summary_path, "w", encoding="utf-8") as f:
    f.write("All 4 test cases complete\n\n")
    for line in summary:
        f.write(line + "\n")
print(f"\nSummary saved to test_summary.txt")
