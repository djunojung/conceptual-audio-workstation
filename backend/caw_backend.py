from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
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

# Route 3: Remix From One or Two Decompositions
@app.route("/remix_from_decomposition", methods=["POST"])
def remix_from_combined():
    data = request.json
    name = data.get("concept", "Hybrid Concept")
    first = data.get("first", None)
    second = data.get("second", None)
    blend = data.get("blend", 50)

    if first and second:
        prompt = f"""
You are a metaphor composer. Blend two conceptual decompositions into a single hybrid and generate a metaphor.

Concept: {name}
Blend weight: {blend}% from concept 1, {100 - blend}% from concept 2

Decomposition 1:
{first}

Decomposition 2:
{second}

Instructions:
- Identify complementary or resonant image schemas, functions, archetypes, and emotions.
- Generate a metaphorical title (1 line) and a poetic 2–3 sentence explanation reflecting the synthesis.
"""
    else:
        prompt = f"""
You are a metaphor composer. Use the conceptual decomposition of the object "{name}" to create a metaphor.

Consider:
- Image schemas
- Functional primitives
- Archetype
- Emotion
- Relational metaphors

Generate a metaphorical title (1 line), followed by a poetic 2–3 sentence explanation inspired by the *essence* of the concept.
        """

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8
        )
        message = response.choices[0].message.content.strip()
        return jsonify({"metaphor": message})
    except Exception as e:
        print("OpenAI API error:", str(e))
        return jsonify({"error": str(e)}), 500

# Run the server
if __name__ == "__main__":
    app.run(debug=True)
