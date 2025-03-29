# The Oracle - A Cryptic AI

A mystical AI chatbot that speaks in riddles and cryptic messages. Users must first solve a riddle to gain access to the Oracle's wisdom.

## Features

- Mystical dark theme interface with glowing effects
- Riddle-based access system
- Cryptic Oracle responses
- Responsive design
- Real-time chat interface

## Prerequisites

- Python 3.8 or higher
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd the-oracle
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install the required packages:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the project root and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

## Running the Application

1. Start the Flask server:
```bash
python app.py
```

2. Open your web browser and navigate to:
```
http://localhost:5000
```

## How to Use

1. You will first encounter the Gatekeeper, who will present you with a riddle
2. Solve the riddle to gain access to the Oracle
3. Once granted access, you can ask questions to the Oracle
4. The Oracle will respond with cryptic messages following specific rules:
   - For "Where?" questions: Mystical location descriptions
   - For "Where? Where?" questions: Special cryptic responses
   - For "Which site?" questions: References to CSI VIT
   - For other questions: Default cryptic responses

## Project Structure

```
the-oracle/
├── app.py              # Flask backend
├── requirements.txt    # Python dependencies
├── static/
│   ├── style.css      # Mystical styling
│   └── script.js      # Frontend logic
└── templates/
    └── index.html     # Main interface
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details. 