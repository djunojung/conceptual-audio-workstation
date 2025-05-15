from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
import json
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")
print(f"Loaded OpenAI key: {openai.api_key[:5]}...")  # Optional debug check

app = Flask(__name__)
CORS(app)

# Route 1: Standard Metaphor Generator
@app.route("/generate_metaphor", methods=["POST"])
def generate_metaphor():
    data = request.json
    object1 = data.get("object1")
    object2 = data.get("object2")
    sliders = data.get("sliders", {})

    prompt = f"""
    Combine the following two concepts into a metaphorical blend.

    Concept 1: {object1}
    Concept 2: {object2}

    Consider the following tone preferences:
    - Organic to Synthetic: {sliders.get('organic_synthetic', 50)}
    - Static to Dynamic: {sliders.get('static_dynamic', 50)}
    - Poetic to Literal: {sliders.get('poetic_literal', 50)}
    - Concrete to Abstract: {sliders.get('concrete_abstract', 50)}

    Output a metaphorical title (one line) followed by a 2–3 sentence explanation.
    """

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        message = response.choices[0].message.content.strip()
        return jsonify({"metaphor": message})
    except Exception as e:
        print("OpenAI API error:", str(e))
        return jsonify({"error": str(e)}), 500

# Route 2: Concept Decomposer
@app.route("/decompose_concept", methods=["POST"])
def decompose_concept():
    data = request.json
    concept = data.get("concept")

    prompt = f"""
You are a cognitive decomposer. Deconstruct the concept "{concept}" into the following semantic primitives:

1. **Image Schemas** (basic embodied patterns like CONTAINER, PATH, BALANCE)
2. **Functional Primitives** (verbs or operations it performs: Reflect, Cut, Bind, etc.)
3. **Archetypal Role** (mythic or symbolic function, described with 1–2 sentences)
4. **Emotional Tone** (emotion it evokes or implies)
5. **Cultural Frames** (how it changes meaning across Nature, Technology, Myth, Design)
6. **Relational Skeletons** (common metaphor forms it fits, like “X is a mirror of Y”)

Format as JSON:
{{
  "image_schemas": [...],
  "functional_primitives": [...],
  "archetype": "...",
  "emotion": "...",
  "frames": {{
    "nature": "...",
    "technology": "...",
    "myth": "...",
    "design": "..."
  }},
  "relations": ["..."]
}}
    """

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6
        )
        message = response.choices[0].message.content.strip()
        return jsonify({"decomposition": message})
    except Exception as e:
        print("OpenAI API error:", str(e))
        return jsonify({"error": str(e)}), 500

def is_selector_decomposition(d):
    return d.get("archetype") == "User-Injected" and d.get("frames", {}).get("nature") == "Injected"

@app.route("/remix_from_decomposition", methods=["POST"])
def remix_from_combined():
    print("🎯 remix_from_combined() called")
    data = request.json
    name = data.get("concept", "Hybrid Concept")
    first = data.get("first", None)
    second = data.get("second", None)
    blend = data.get("blend", 50)

    # Check if inputs are from a Selector module
    first_is_selector = is_selector_decomposition(first) if first else False
    second_is_selector = is_selector_decomposition(second) if second else False

    if first and second:
        prompt = f"""
You are a metaphor composer. The user has selected symbolic primitives to guide a synthesis of two conceptual decompositions.

Concept: {name}
Blend weight: {blend}% from concept 1, {100 - blend}% from concept 2

Decomposition 1 {"(user-selected primitives)" if first_is_selector else ""}:
{json.dumps(first, indent=2)}

Decomposition 2 {"(user-selected primitives)" if second_is_selector else ""}:
{json.dumps(second, indent=2)}

Instructions:
- You MUST use the symbolic primitives as compositional constraints.
- Generate a metaphorical title and a poetic 2–3 sentence description that integrates the symbolic ideas.
- For each primitive in the decompositions, explain how it directly influenced the metaphor.

Respond in JSON format like this:
{{
  "title": "Threads of Return",
  "description": "A metaphor of time as a spiral thread, folding the past into the future...",
  "mapping": {{
    "Concept 1 – PATH": "The metaphor describes a looping journey",
    "Concept 2 – CONTAINER": "Used in the image of memory as a vessel"
  }}
}}
"""
    else:
        prompt = f"""
You are a metaphor composer. The user has intentionally selected symbolic primitives to guide the synthesis for the concept "{name}".

Decomposition ({'user-selected primitives' if first_is_selector else 'system-generated'}):
{json.dumps(first, indent=2)}

Instructions:
- Use the symbolic primitives as hard compositional rules.
- Generate a metaphorical title and poetic 2–3 sentence explanation.
- For each symbolic primitive, explain how it directly influenced the metaphor.

Respond in JSON format like this:
{{
  "title": "The Winding Stair",
  "description": "A metaphor for growth as a spiraling path inward...",
  "mapping": {{
    "PATH": "Appears in the spiral structure of movement inward",
    "REFLECT": "Used in the idea of the self gazing inward"
  }}
}}
"""


    try:
        print(prompt)
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8
        )
        message = response.choices[0].message.content.strip()

try:
    parsed = json.loads(message)
except json.JSONDecodeError:
    parsed = {
        "title": "⚠️ Error parsing GPT response",
        "description": message,
        "mapping": {}
    }

return jsonify(parsed)
        return jsonify({"metaphor": message})
    except Exception as e:
        print("OpenAI API error:", str(e))
        return jsonify({"error": str(e)}), 500


# Run the server
if __name__ == "__main__":
    app.run(debug=True)
