// Website Challenge Handler
let isWaitingForPassword = false;
const CORRECT_PASSWORD = 'hidden_treasure_123';

// Create victory sound
function playVictorySound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0.7, audioContext.currentTime); // Loud master volume
    masterGain.connect(audioContext.destination);

    // Main victory melody frequencies (triumphant fanfare in C major)
    const melodyNotes = [
        523.25, // C5
        659.25, // E5
        783.99, // G5
        1046.50 // C6
    ];

    // Create a repeating melody
    function playMelodyNote(noteIndex, time) {
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Mix of square and sawtooth for a rich, brassy sound
        osc.type = noteIndex % 2 === 0 ? 'square' : 'sawtooth';
        osc.frequency.setValueAtTime(melodyNotes[noteIndex % melodyNotes.length], time);
        
        // Loud attack, slight decay
        gainNode.gain.setValueAtTime(0.5, time);
        gainNode.gain.exponentialRampToValueAtTime(0.4, time + 0.1);
        
        osc.connect(gainNode);
        gainNode.connect(masterGain);
        
        osc.start(time);
        osc.stop(time + 0.25); // Quarter note duration
    }

    // Background chord
    function playChord(time, duration) {
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
        frequencies.forEach(freq => {
            const osc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);
            
            gainNode.gain.setValueAtTime(0.3, time);
            gainNode.gain.exponentialRampToValueAtTime(0.2, time + duration);
            
            osc.connect(gainNode);
            gainNode.connect(masterGain);
            
            osc.start(time);
            osc.stop(time + duration);
        });
    }

    // Schedule the continuous melody for 5 seconds
    const startTime = audioContext.currentTime;
    const endTime = startTime + 5;
    
    // Play continuous background chord
    playChord(startTime, 5);

    // Play repeating melody notes
    for (let time = startTime; time < endTime; time += 0.25) {
        const noteIndex = Math.floor((time - startTime) * 4) % melodyNotes.length;
        playMelodyNote(noteIndex, time);
    }

    // Add triumphant percussion (rhythmic pulses)
    for (let time = startTime; time < endTime; time += 0.5) {
        const noise = audioContext.createOscillator();
        const noiseGain = audioContext.createGain();
        
        noise.type = 'square';
        noise.frequency.setValueAtTime(130.81, time); // C3 for bass drum effect
        
        noiseGain.gain.setValueAtTime(0.3, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        
        noise.connect(noiseGain);
        noiseGain.connect(masterGain);
        
        noise.start(time);
        noise.stop(time + 0.1);
    }

    // Final crescendo in the last second
    masterGain.gain.setValueAtTime(0.7, endTime - 1);
    masterGain.gain.linearRampToValueAtTime(1, endTime - 0.1);
    masterGain.gain.linearRampToValueAtTime(0, endTime);
}

document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const form = document.querySelector('form');
    const sendButton = document.querySelector('.send-button');

    // Watch for website link in messages
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains('oracle-message')) {
                    if (node.textContent.includes('csi.vit.edu.in')) {
                        setTimeout(() => {
                            const hintMessage = document.createElement('div');
                            hintMessage.className = 'message oracle-message website-hint';
                            hintMessage.textContent = "Seeker, venture into the digital temple's source. Within its sacred code lies the key to enlightenment. Inspect the foundations to reveal the hidden truth.";
                            chatMessages.appendChild(hintMessage);
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                            isWaitingForPassword = true;
                            userInput.placeholder = "Enter the sacred code...";
                            
                            // Override the original sendMessage function
                            window.sendMessage = function() {
                                const message = userInput.value.trim();
                                if (message && isWaitingForPassword) {
                                    handlePasswordAttempt(message);
                                    userInput.value = '';
                                    return false;
                                }
                            };
                        }, 1000);
                    }
                }
            });
        });
    });

    observer.observe(chatMessages, { childList: true, subtree: true });

    // Override form submission
    if (form) {
        const originalSubmit = form.onsubmit;
        form.onsubmit = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (isWaitingForPassword) {
                const message = userInput.value.trim();
                if (message) {
                    handlePasswordAttempt(message);
                    userInput.value = '';
                }
                return false;
            }
            return originalSubmit && originalSubmit.call(this, e);
        };
    }

    // Override send button click
    if (sendButton) {
        const originalClick = sendButton.onclick;
        sendButton.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (isWaitingForPassword) {
                const message = userInput.value.trim();
                if (message) {
                    handlePasswordAttempt(message);
                    userInput.value = '';
                }
                return false;
            }
            return originalClick && originalClick.call(this, e);
        };
    }
});

function handlePasswordAttempt(password) {
    const chatMessages = document.getElementById('chat-messages');
    
    // Add user's attempt to chat with typing animation
    const userMessage = document.createElement('div');
    userMessage.className = 'message user-message typing';
    userMessage.textContent = password;
    chatMessages.appendChild(userMessage);
    setTimeout(() => userMessage.classList.remove('typing'), 500);

    // Check password
    const oracleMessage = document.createElement('div');
    oracleMessage.className = 'message oracle-message';
    
    if (password === CORRECT_PASSWORD) {
        // Play victory sound (using existing playVictorySound function)
        playVictorySound();
        
        // Create sparkles container
        const sparklesContainer = document.createElement('div');
        sparklesContainer.className = 'sparkles-container';
        oracleMessage.appendChild(sparklesContainer);
        
        // Add sparkles
        for (let i = 0; i < 20; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.animationDelay = Math.random() * 2 + 's';
            sparklesContainer.appendChild(sparkle);
        }
        
        // Create victory message with animation
        const victoryText = document.createElement('div');
        victoryText.className = 'victory-text';
        victoryText.innerHTML = `
            🎉 VICTORY ACHIEVED! 🏆<br>
            <span class="victory-detail">The ancient code resonates with truth!</span><br>
            <span class="victory-detail">You have proven yourself worthy of the digital mysteries.</span><br>
            <span class="victory-detail">The Oracle acknowledges your wisdom, seeker of knowledge!</span>
        `;
        oracleMessage.appendChild(victoryText);
        
        oracleMessage.classList.add('correct-answer');
        isWaitingForPassword = false;
        document.getElementById('user-input').placeholder = "Type your message...";
        
        // Enhanced victory animation
        oracleMessage.style.animation = 'victoryPulse 2s infinite, rainbow 5s infinite';
        
        // Add victory effects to the chat container
        chatMessages.classList.add('victory-achieved');
        setTimeout(() => chatMessages.classList.remove('victory-achieved'), 5000);
        
        // Restore original sendMessage function (preserving existing functionality)
        window.sendMessage = window.originalSendMessage;
    } else {
        // Play error sound
        playErrorSound();
        
        // Array of varied incorrect password messages
        const incorrectMessages = [
            "❌ The digital mysteries remain veiled. Your code lacks the ancient power. Try again, seeker.",
            "❌ The sacred algorithms reject this offering. Search deeper in the source.",
            "❌ Your attempt echoes in the void. The true code remains hidden in plain sight.",
            "❌ The digital spirits whisper of failure. Look closer at the temple's foundation.",
            "❌ Not quite, brave seeker. The answer lies in the website's sacred architecture.",
            "❌ The Oracle senses uncertainty in your input. The truth is written in the digital scrolls.",
            "❌ Your offering falls short of enlightenment. Inspect the sacred source for guidance."
        ];
        
        oracleMessage.textContent = incorrectMessages[Math.floor(Math.random() * incorrectMessages.length)];
        oracleMessage.classList.add('incorrect-answer');
        setTimeout(() => oracleMessage.classList.remove('incorrect-answer'), 1000);
    }
    
    chatMessages.appendChild(oracleMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Disable input briefly after attempt
    const userInput = document.getElementById('user-input');
    const sendButton = document.querySelector('.send-button');
    userInput.disabled = true;
    sendButton.disabled = true;
    setTimeout(() => {
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus();
    }, 1000);
}

// Add error sound effect
function playErrorSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
}

// Add enhanced animations and styles while preserving existing ones
const enhancedStyle = document.createElement('style');
enhancedStyle.textContent = `
    .typing {
        opacity: 0;
        animation: fadeIn 0.5s forwards;
    }
    
    .incorrect-answer {
        animation: shake 0.5s;
    }
    
    .victory-achieved {
        animation: victoryBackground 5s;
    }
    
    .sparkles-container {
        position: absolute;
        width: 100%;
        height: 100%;
        pointer-events: none;
    }
    
    .sparkle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: #fff;
        border-radius: 50%;
        animation: sparkle 2s linear infinite;
    }
    
    .victory-text {
        position: relative;
        z-index: 1;
        font-size: 1.2em;
        line-height: 1.5;
        text-align: center;
        padding: 20px;
    }
    
    .victory-detail {
        display: block;
        font-size: 0.9em;
        opacity: 0;
        animation: fadeInUp 0.5s forwards;
    }
    
    .victory-detail:nth-child(2) { animation-delay: 0.5s; }
    .victory-detail:nth-child(3) { animation-delay: 1s; }
    
    @keyframes fadeIn {
        to { opacity: 1; }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes rainbow {
        0% { color: #ff0000; }
        20% { color: #ffa500; }
        40% { color: #ffff00; }
        60% { color: #00ff00; }
        80% { color: #0000ff; }
        100% { color: #ff0000; }
    }
    
    @keyframes sparkle {
        0% { transform: scale(0) rotate(0deg); opacity: 0; }
        50% { transform: scale(1) rotate(180deg); opacity: 1; }
        100% { transform: scale(0) rotate(360deg); opacity: 0; }
    }
    
    @keyframes victoryBackground {
        0% { background: rgba(155, 109, 255, 0); }
        10% { background: rgba(155, 109, 255, 0.1); }
        90% { background: rgba(155, 109, 255, 0.1); }
        100% { background: rgba(155, 109, 255, 0); }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(enhancedStyle);