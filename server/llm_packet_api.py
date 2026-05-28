from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


HOST = "127.0.0.1"
PORT = int(os.getenv("AUTHASSISTENT_API_PORT", "8000"))
API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-10-21")


def fallback_packet(packet):
    found = packet.get("foundEvidence", [])
    missing = packet.get("missingEvidence", [])
    lines = ["LLM fallback draft for human review:"]

    for evidence in found:
        lines.append(f"- {evidence.get('summary')} Source: {evidence.get('sourceId')}.")

    for item in missing:
        lines.append(
            f"- {item.get('requirement')} is missing from available synthetic records. "
            "Human review needed before this packet moves forward."
        )

    return "\n".join(lines)


def build_prompt(packet):
    return {
        "role": "user",
        "content": (
            "Draft a concise prior authorization evidence packet for human review only.\n"
            "Rules:\n"
            "- Use only the provided source-backed evidence.\n"
            "- Do not diagnose, recommend treatment, approve coverage, or submit anything.\n"
            "- Every factual sentence must include source IDs in brackets.\n"
            "- Missing evidence must be stated as missing and require human review.\n\n"
            f"Packet JSON:\n{json.dumps(packet, indent=2)}"
        ),
    }


def call_azure_openai(packet):
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT", "").rstrip("/")
    api_key = os.getenv("AZURE_OPENAI_API_KEY", "")
    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "")

    if not endpoint or not api_key or not deployment:
        return {
            "mode": "deterministic-fallback",
            "draft": fallback_packet(packet),
            "warning": "Azure OpenAI environment variables are not fully configured.",
        }

    url = f"{endpoint}/openai/deployments/{deployment}/chat/completions?api-version={API_VERSION}"
    payload = {
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are AuthAssist AI, a prior authorization evidence drafting assistant. "
                    "You draft review material only and never fabricate evidence."
                ),
            },
            build_prompt(packet),
        ],
        "temperature": 0.2,
        "max_tokens": 700,
    }

    request = Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "api-key": api_key,
        },
        method="POST",
    )

    with urlopen(request, timeout=30) as response:
        data = json.loads(response.read().decode("utf-8"))

    draft = data["choices"][0]["message"]["content"]
    return {"mode": "azure-openai", "draft": draft}


class Handler(BaseHTTPRequestHandler):
    def _send_json(self, status, body):
        encoded = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Access-Control-Allow-Origin", "http://127.0.0.1:5173")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(encoded)

    def do_OPTIONS(self):
        self._send_json(204, {})

    def do_POST(self):
        if self.path != "/api/packet-draft":
            self._send_json(404, {"error": "Not found"})
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length).decode("utf-8")
            packet = json.loads(body).get("packet", {})
            self._send_json(200, call_azure_openai(packet))
        except HTTPError as error:
            self._send_json(
                502,
                {
                    "error": "Azure OpenAI request failed.",
                    "status": error.code,
                    "draft": fallback_packet(json.loads(body).get("packet", {})),
                    "mode": "deterministic-fallback",
                },
            )
        except (URLError, TimeoutError):
            self._send_json(
                502,
                {
                    "error": "Azure OpenAI request could not be reached.",
                    "draft": fallback_packet(json.loads(body).get("packet", {})),
                    "mode": "deterministic-fallback",
                },
            )
        except Exception as error:
            self._send_json(400, {"error": str(error)})

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"AuthAssist AI LLM API running at http://{HOST}:{PORT}")
    server.serve_forever()
