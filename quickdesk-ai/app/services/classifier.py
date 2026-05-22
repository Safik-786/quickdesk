import json
import re
from app.config import (
    ALLOWED_CATEGORIES, ALLOWED_PRIORITIES,
    LLM_PROVIDER, OPENAI_API_KEY, GROQ_API_KEY,
    OPENAI_MODEL, GROQ_MODEL,
)
from app.services.llm_factory import get_llm

CLASSIFY_PROMPT = """You are a helpdesk ticket classifier. Given a support ticket, return ONLY a JSON object with two fields:
- "category": one of {categories}
- "priority": one of {priorities}

Rules:
- IT: technical issues (VPN, software, hardware, network, laptop, password)
- HR: people/HR issues (leave, onboarding, policies)
- Finance: money-related (expenses, reimbursement, invoices)
- Admin: general admin (access, permissions, office)
- Other: anything that doesn't fit above

Priority rules:
- High: blocking work, security issue, or urgent
- Medium: inconvenient but workable
- Low: informational or non-urgent

Ticket Title: {title}
Ticket Description: {description}

Respond with ONLY valid JSON, no explanation:"""


async def classify_ticket(title: str, description: str) -> dict:
    llm = get_llm()

    prompt = CLASSIFY_PROMPT.format(
        categories=", ".join(ALLOWED_CATEGORIES),
        priorities=", ".join(ALLOWED_PRIORITIES),
        title=title,
        description=description,
    )

    try:
        response = await llm.ainvoke(prompt)
        content = response.content if hasattr(response, "content") else str(response)

        # Extract JSON from response (handle markdown code blocks)
        json_match = re.search(r'\{.*?\}', content, re.DOTALL)
        if not json_match:
            raise ValueError("No JSON found in response")

        parsed = json.loads(json_match.group())
        category = parsed.get("category", "Other")
        priority = parsed.get("priority", "Medium")

        # Validate against allowed values — fallback if LLM hallucinates
        if category not in ALLOWED_CATEGORIES:
            category = "Other"
        if priority not in ALLOWED_PRIORITIES:
            priority = "Medium"

        return {"category": category, "priority": priority}

    except Exception as e:
        print(f"[Classifier] Error: {e}. Using fallback.")
        return {"category": "Other", "priority": "Medium"}
