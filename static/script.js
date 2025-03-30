let currentRiddle = null;
let attempts = 0;
const MAX_ATTEMPTS = 3;
let messageCount = 0;
let trapTriggered = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    getNewRiddle();
    initializeChat();
});

function initializeChat() {
    const userInput = document.getElementById('user-input');
    const sendButton = document.querySelector('.send-button');
    
    if (userInput && sendButton) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

// Get a new riddle from the server
async function getNewRiddle() {
    try {
        const response = await fetch('/api/riddle');
        const data = await response.json();
        currentRiddle = data;
        document.getElementById('riddle-text').textContent = data.riddle;
        document.getElementById('riddle-answer').value = '';
        document.getElementById('riddle-feedback').textContent = '';
    } catch (error) {
        console.error('Error fetching riddle:', error);
    }
}

// Submit riddle answer
async function submitRiddle() {
    const answer = document.getElementById('riddle-answer').value.trim().toLowerCase();
    if (!answer) return;

    try {
        const response = await fetch('/api/verify-riddle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                answer: answer,
                riddle: currentRiddle.riddle
            })
        });

        const data = await response.json();
        document.getElementById('riddle-feedback').textContent = data.message;

        if (data.correct) {
            setTimeout(() => {
                document.getElementById('gatekeeper-section').classList.remove('active');
                document.getElementById('oracle-section').classList.add('active');
                addMessage("Welcome, seeker of truth. The Oracle awaits your questions.", 'oracle');
            }, 2000);
        } else {
            attempts++;
            if (attempts >= MAX_ATTEMPTS) {
                setTimeout(() => {
                    attempts = 0;
                    getNewRiddle();
                }, 2000);
            }
        }
    } catch (error) {
        console.error('Error verifying riddle:', error);
    }
}

// Send message to the Oracle
async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage(message, 'user');
    input.value = '';

    try {
        // Check if this might be an answer attempt
        const isAnswerAttempt = /answer|solution|code|key|password|found it|inspect|source/i.test(message);
        
        const response = await fetch('/api/oracle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: message,
                isAnswerAttempt: isAnswerAttempt
            })
        });

        const data = await response.json();
        
        // Handle the response based on its type
        if (data.isWebsiteLink) {
            // If it's the website link message, store this state
            localStorage.setItem('hasReceivedLink', 'true');
            addMessage(data.response, 'oracle');
        } else if (data.isAnswerResponse) {
            if (data.isCorrect) {
                addMessage(data.response, 'oracle');
                // Handle successful answer - could add special effects or unlock new features
            } else {
                // Show hint about inspection
                addMessage(data.response, 'oracle');
            }
        } else {
            addMessage(data.response, 'oracle');
        }
        
        // Check for trap condition after oracle responds
        messageCount++;
        console.log('Message count:', messageCount);
        if (messageCount >= 2 && !trapTriggered) {
            setTimeout(() => {
                showEliminationTrap();
            }, 1000);
        }
    } catch (error) {
        console.error('Error sending message:', error);
        addMessage("The Oracle's vision is clouded. Seek wisdom again when the digital mists clear.", 'oracle');
    }
}

// Add message to chat
function addMessage(text, sender) {
    const messagesDiv = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function showEliminationTrap() {
    console.log('Showing elimination trap...');
    trapTriggered = true;
    
    // Add the trap message
    const trapMessage = "The stone gate creaks open, a narrow path beyond. But beware, for only the bold step forward. To leave now is to embrace fate, for better… or worse. Do you dare?";
    addMessage(trapMessage, 'oracle');
    
    // Create and add exit button
    const inputContainer = document.querySelector('#oracle-section .input-container');
    console.log('Input container:', inputContainer);
    
    if (inputContainer) {
        // Remove any existing exit button
        const existingExitButton = inputContainer.querySelector('.exit-button');
        if (existingExitButton) {
            existingExitButton.remove();
        }
        
        // Create new exit button with more prominent styling
        const exitButton = document.createElement('button');
        exitButton.className = 'mystical-button exit-button';
        exitButton.textContent = 'Dare';
        exitButton.style.fontSize = '1.1rem';
        exitButton.style.padding = '0.8rem 2rem';
        exitButton.onclick = handleElimination;
        inputContainer.appendChild(exitButton);
        console.log('Exit button added');
    } else {
        console.error('Could not find input container');
    }
}

// Add beep sound function
function playBeep() {
    try {
        // Create audio element
        const audio = new Audio();
        audio.volume = 1.0; // Maximum volume
        
        // Generate a data URI for a loud beep sound
        const sampleRate = 44100;
        const duration = 5; // seconds
        const frequency = 800;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const channelData = arrayBuffer.getChannelData(0);
        
        // Generate a loud square wave
        for (let i = 0; i < arrayBuffer.length; i++) {
            channelData[i] = Math.sign(Math.sin(2 * Math.PI * frequency * i / sampleRate)) * 0.8;
        }
        
        // Convert the buffer to a source node
        const source = audioContext.createBufferSource();
        source.buffer = arrayBuffer;
        
        // Create a gain node for volume control
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 1.0; // Full volume
        
        // Connect nodes and play
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        source.start();
        
        // Ensure cleanup
        setTimeout(() => {
            source.stop();
            audioContext.close();
        }, duration * 10000);
        
        console.log('Beep sound played');
    } catch (error) {
        console.error('Error playing beep:', error);
        
        // Fallback method using simple Audio element
        try {
            const fallbackBeep = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRA0PVqzn77BdGAg+ltryxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHgU2jdXzzn0vBSF1xe/glEILElyx6OyrWBUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnEYODlOq5O+zYBoGPJPY88p2KwUme8rx3I4+CRZiturqpVITC0mi4PK8aB8GM4nU8tGAMQYfcsLu45ZFDBFYr+ftrVoXCECY3PLEcSYELIHO8diJOQgZaLvt559NEAxPqOPwtmMcBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGnt/yvmwhBTCG0fPTgjQGHW/A7eSaRQ0PVqzl77BeGQc9ltvyxnUoBSh+zPDaizsIGGS56+mjTxELTKXh8bllHgU1jdT0z3wvBSJ1xe/glEILElyx6OyrWRUIRJve8sFuJAUug8/z1YU2BRxqvu3mnEYODlOq5O+zYRsGPJPY88p3KgUme8rx3I4+CRVht+rqpVITC0mh4PK8aiAFM4nU8tGAMQYfccPu45ZFDBFYr+ftrVwWCECY3PLEcSYELIHO8diJOQgZaLvt559NEAxPqOPwtmMcBjiP1/PMeS0GI3fH8N+RQAoUXrTp66hVFApGnt/yvmwhBTCG0fPTgjQGHW/A7eSaRQ0PVqzl77BeGQc9ltrzyxnUoBSh+zPDaizsIGGS56+mjTxELTKXh8bllHgU1jdT0z3wvBSJ1xe/glEILElyx6OyrWRUIRJve8sFuJAUug8/z1YU2BRxqvu3mnEYODlOq5O+zYRsGPJPY88p3KgUme8rx3I4+CRVht+rqpVITC0mh4PK8aiAFM4nU8tGAMQYfccPu45ZFDBFYr+ftrVwWCECX2/PEciYELH/N8diJOQgZZ7vs56BODwxPpuPxtmQdBjiP1/PMeywGI3bH8d+RQQkUXrTp66hWFApGnt/yv2wiBTCG0fPTgzQHHm3A7eSaSw0PVqzl77BeGQc9ltrzyxnUoBSh9y/HajDwIF2W56+mjUREKTKPi8blnHgU1jdTy0HwvBSJ0xe/glEQKElux6eyrWRUIRJrd88FwJAUug8/z1YY2BRxqvu3mnUUPDlKp5e+zYRsGOpPY88p3KgUmessw3Y4+CRVht+rqpVITC0mh4PK9aiAFM4nU8tGAMQYfccLv45dGCxFYr+ftrVwWCA==');
            fallbackBeep.play();
            console.log('Fallback beep played');
        } catch (fallbackError) {
            console.error('Fallback beep failed:', fallbackError);
        }
    }
}

function handleElimination() {
    console.log('Handling elimination...');
    
    // Play the beep sound immediately
    playBeep();
    
    // Add elimination message with delay
    setTimeout(() => {
        addMessage("One player has been eliminated from your team...", 'oracle');
        
        // Disable all input elements
        const userInput = document.getElementById('user-input');
        const sendButton = document.querySelector('.send-button');
        const exitButton = document.querySelector('.exit-button');
        
        if (userInput) userInput.disabled = true;
        if (sendButton) sendButton.disabled = true;
        if (exitButton) exitButton.disabled = true;
        
        // Add visual effects for elimination
        document.body.style.animation = 'fadeToRed 2s forwards';
        document.querySelector('.chat-container').classList.add('eliminated');

        // Re-enable after 10 seconds
        setTimeout(() => {
            if (userInput) userInput.disabled = false;
            if (sendButton) sendButton.disabled = false;
            if (exitButton) {
                exitButton.remove(); // Remove the exit button
            }
            
            // Reset visual effects
            document.body.style.animation = 'fadeFromRed 2s forwards';
            document.querySelector('.chat-container').classList.remove('eliminated');
            
            // Add recovery message
            addMessage("The Oracle's power subsides, allowing you to continue...", 'oracle');
        }, 10000); // 10 seconds
    }, 100); // Small delay to ensure sound plays first
}

// Add new CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeToRed {
        from { background-color: var(--primary-color); }
        to { background-color: #4a0000; }
    }
    
    @keyframes fadeFromRed {
        from { background-color: #4a0000; }
        to { background-color: var(--primary-color); }
    }
    
    @keyframes fadeToGold {
        from { background-color: var(--primary-color); }
        to { background-color: #2a1f00; }
    }
    
    .victorious {
        border: 2px solid gold;
        box-shadow: 0 0 20px gold;
    }
`;
document.head.appendChild(style);

document.getElementById('riddle-answer').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitRiddle();
    }
}); 