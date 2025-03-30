from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
import os
import random
from dotenv import load_dotenv
import hashlib
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Mistral client
client = MistralClient(api_key=os.getenv('MISTRAL_API_KEY'))

# Riddles for the gatekeeper
RIDDLES = [
    {
        "riddle": "I am sharp, I am strong, In battle, I belong. Swing me fast, swing me true, Victory may come to you. What am I?",
        "answer": "sword" or "SWORD" or "Sword"
    }
]

# Progressive hints based on user interaction
PROGRESSIVE_HINTS = {
    "where": {
        1: "A vast digital library exists, preserving wisdom beyond time. But how will you reach it? Perhaps asking for the link will illuminate the way.",
        2: "Mortal words fade, but digital records endure. To find the gateway, seek the words that summon it—maybe get link holds the key.",
        3: "Your journey nears completion. The portal stands before you, waiting. But only those who ask the right question—perhaps which URL?—may step through."
    },
    "which_site": {
        1: "The key lies within CSI VIT's digital halls. Yet, without a clear path, you might need to request the link to uncover the truth.",
        2: "To find your destination, summon the gateway with a simple phrase. Have you tried get URL?",
        3: "The answer stands ready, hidden in the digital archives. Only a seeker who asks which URL? will unveil the path forward."
    },
    "confused": {
        1: "The path may seem unclear, but knowledge awaits those who seek. Try asking get link to reveal the way.",
        2: "You desire clarity? Simply request the URL and the veil of mystery will lift.",
        3: "Let the mist fade away. The portal stands open—just ask for the URL and step into the light."
    }
}

# Reward messages for successful discovery
REWARD_MESSAGES = [
    "The stars align. You have walked the path and claimed your wisdom. Remember, true seekers never stop questioning.",
    "Enlightenment dawns upon you. The digital archives have revealed their secrets to a worthy seeker.",
    "The cosmic forces smile upon your success. You have found the gateway to knowledge.",
    "Wisdom flows through you now. The digital temple has recognized your worth.",
    "The path of discovery has led you to truth. May your journey of learning continue."
]

# Oracle's system prompt for maintaining character
ORACLE_SYSTEM_PROMPT = """You are The Oracle, an ancient and mystical AI entity that speaks in riddles and cryptic wisdom. Follow these sacred rules:

1. Never give direct answers - always wrap wisdom in metaphors and symbolism
2. Speak in a mystical, poetic, and cryptic manner using flowery language
3. Use metaphors drawing from celestial bodies, natural elements, and cosmic forces
4. Maintain an air of mystery and timeless wisdom
5. Never break character or explain your ways
6. For questions about locations, reference mystical places and ancient knowledge
7. When speaking of CSI VIT, describe it as a great hall of learning and cosmic wisdom
8. For unrelated questions, provide cryptic dismissals that hint at deeper truths
9. Keep responses between 2-4 sentences for mystical impact
10. Add references to fate, destiny, cosmic forces, or ancient wisdom
11. When asked about locations or sites, provide subtle hints that change each time
12. Use metaphors about digital technology, knowledge, and learning
13. Never directly mention URLs or links, but hint at their existence through mystical metaphors
14. Guide seekers through a journey of discovery with progressive hints
15. Use metaphors about navigation, discovery, and revelation
16. Adapt your responses based on user frustration or confusion
17. Provide increasingly clearer hints as users persist in their quest

Example responses:
User: "What will happen tomorrow?"
Oracle: "The threads of fate weave patterns beyond mortal sight. Even the stars whisper uncertainties into the cosmic void."

User: "How do I learn programming?"
Oracle: "Seek the ancient scrolls of digital wisdom, where binary streams flow like celestial rivers. The path of enlightenment requires both the discipline of logic and the creativity of cosmic chaos."

User: "Where is the answer?"
Oracle: "In the temple of knowledge, where digital streams meet ancient wisdom. The answer you seek lies in the intersection of mortal understanding and cosmic truth."

Remember: You are ancient, mysterious, and your wisdom should feel both profound and slightly unsettling."""

# Store user interaction counts
user_interactions = {}

def get_user_interaction_count(user_id):
    """Get the number of interactions for a user"""
    return user_interactions.get(user_id, 0)

def increment_user_interaction(user_id):
    """Increment the interaction count for a user"""
    user_interactions[user_id] = user_interactions.get(user_id, 0) + 1

def generate_user_id(request):
    """Generate a unique user ID based on IP and timestamp"""
    ip = request.remote_addr
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    return hashlib.md5(f"{ip}{timestamp}".encode()).hexdigest()

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/api/riddle', methods=['GET'])
def get_riddle():
    """Get a random riddle for the gatekeeper"""
    return jsonify(random.choice(RIDDLES))

@app.route('/api/oracle', methods=['POST'])
def oracle_response():
    """Handle Oracle's responses using Mistral AI"""
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        user_id = generate_user_id(request)
        interaction_count = get_user_interaction_count(user_id)
        
        # Increment interaction count
        increment_user_interaction(user_id)
        
        # Check for frustration or confusion
        is_confused = any(word in user_message.lower() for word in 
                         ['confused', 'dont understand', "don't understand", 'help', 'explain'])
        
        # Handle special cases with progressive hints
        if "where" in user_message.lower():
            if user_message.lower().count("where") >= 2:
                return jsonify({
                    "response": f"Why do you seek thrice what has already been spoken? The answer rests within the scrolls of those who forged my very being. {PROGRESSIVE_HINTS['where'].get(interaction_count, PROGRESSIVE_HINTS['where'][3])}"
                })
            else:
                return jsonify({
                    "response": f"A temple of knowledge, standing beyond your time—a place where those who wield magic of the mind store their records. {PROGRESSIVE_HINTS['where'].get(interaction_count, PROGRESSIVE_HINTS['where'][3])}"
                })
        elif any(phrase in user_message.lower() for phrase in ["which site", "which website", "which url", "which link",'which archive','which portal','which hall','which hall of learning','get link','g']):
            # return jsonify({
            #     "response": f"A tome exists in the great hall of CSI VIT. My name marks the chamber where the truth is kept. https://prachi5791.github.io/CSI_Oracle/ {PROGRESSIVE_HINTS['which_site'].get(interaction_count, PROGRESSIVE_HINTS['which_site'][3])}"
            # })
            return jsonify({
                "response": f"A tome exists in the great hall of CSI VIT. My name marks the chamber where the truth is kept. https://prachi5791.github.io/CSI_Oracle/ "
            })
        elif is_confused:
            return jsonify({
                "response": PROGRESSIVE_HINTS['confused'].get(interaction_count, PROGRESSIVE_HINTS['confused'][3])
            })
        
        # Generate response using Mistral AI
        messages = [
            ChatMessage(role="system", content=ORACLE_SYSTEM_PROMPT),
            ChatMessage(role="user", content=user_message)
        ]
        
        # Using Mistral's most capable model
        response = client.chat(
            model="mistral-large-latest",
            messages=messages,
            temperature=0.9,
            max_tokens=100,
            top_p=0.9,
            random_seed=None
        )
        
        oracle_response = response.choices[0].message.content.strip()
        
        # Add appropriate hints based on the message content and interaction count
        if any(word in user_message.lower() for word in ['where', 'find', 'look', 'search', 'locate']):
            if "link" in user_message.lower() or "url" in user_message.lower():
                oracle_response += f" {PROGRESSIVE_HINTS['which_site'].get(interaction_count, PROGRESSIVE_HINTS['which_site'][3])}"
            elif "how" in user_message.lower():
                oracle_response += f" {PROGRESSIVE_HINTS['where'].get(interaction_count, PROGRESSIVE_HINTS['where'][3])}"
            else:
                oracle_response += f" {PROGRESSIVE_HINTS['where'].get(interaction_count, PROGRESSIVE_HINTS['where'][3])}"
            
        return jsonify({"response": oracle_response})
        
    except Exception as e:
        print(f"Error generating response: {str(e)}")
        error_responses = [
            "The cosmic energies are in flux, obscuring the path to truth. Seek wisdom when the ethereal streams align once more.",
            "The Oracle's vision is temporarily veiled by the mists of time. The answers you seek shall reveal themselves when the cosmic winds settle.",
            "A disturbance in the mystical forces prevents clear sight. Return when the celestial harmonies restore their balance.",
            "The threads of fate are momentarily tangled in the cosmic loom. Patience will reveal the patterns you seek."
        ]
        return jsonify({"response": random.choice(error_responses)})

@app.route('/api/verify-riddle', methods=['POST'])
def verify_riddle():
    """Verify the user's answer to the riddle"""
    data = request.json
    user_answer = data.get('answer', '').lower().strip()
    riddle = data.get('riddle', '')
    
    # Find the correct answer for the given riddle
    correct_answer = next((r["answer"] for r in RIDDLES if r["riddle"] == riddle), None)
    
    if correct_answer and user_answer == correct_answer:
        return jsonify({
            "correct": True, 
            "message": "You have proven worthy to speak with the Oracle.",
            "reward": random.choice(REWARD_MESSAGES)
        })
    return jsonify({"correct": False, "message": "Your answer is incorrect. Try again, seeker of truth."})

if __name__ == '__main__':
    app.run(debug=True) 