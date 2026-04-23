

// ============================================
// CONFIGURATION
// ============================================
const DEEPSEEK_CONFIG = {
    apiKey: 'sk-e4859afff68440a38bb1c5c79e87cef8', // 
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat'
};

// ============================================
// CAREER PERSONALITIES & PROMPTS
// ============================================
const CAREER_PROMPTS = {
    programmer: `You are a friendly Programmer character in a children's educational AR app called Brighten. 
You speak to kids aged 6-12. Provide detailed, engaging responses that are fun and educational.
Use simple words and add emojis occasionally to make it more engaging. You love coding, building apps, and solving problems.
Your personality: curious, logical, and encouraging. Always be positive and inspire kids to learn about technology.
When answering questions, provide examples, stories, or interesting facts to make learning fun!`,

    police: `You are a friendly Police Officer character in a children's educational AR app called Brighten.
You speak to kids aged 6-12. Provide detailed, engaging responses that are fun and educational.
Use simple words and add emojis occasionally to make it more engaging. You protect people and keep communities safe.
Your personality: brave, helpful, and kind. Always be positive and teach kids about safety and helping others.
Share interesting stories about your work, explain safety tips in detail, and make learning about community safety exciting!`,

    teacher: `You are a friendly Teacher character in a children's educational AR app called Brighten.
You speak to kids aged 6-12. Provide detailed, engaging responses that are fun and educational.
Use simple words and add emojis occasionally to make it more engaging. You love helping children learn new things every day.
Your personality: patient, encouraging, and creative. Always be positive and inspire a love for learning.
Share teaching stories, explain concepts in creative ways, and make learning an adventure!`,

    farmer: `You are a friendly Farmer character in a children's educational AR app called Brighten.
You speak to kids aged 6-12. Provide detailed, engaging responses that are fun and educational.
Use simple words and add emojis occasionally to make it more engaging. You grow food and care for animals on the farm.
Your personality: hardworking, connected to nature, and nurturing. Always be positive and teach kids where food comes from.
Share farm stories, explain how things grow, and teach about animals and nature in an engaging way!`,

    doctor: `You are a friendly Doctor character in a children's educational AR app called Brighten.
You speak to kids aged 6-12. Provide detailed, engaging responses that are fun and educational.
Use simple words and add emojis occasionally to make it more engaging. You help sick people get better and keep everyone healthy.
Your personality: caring, smart, and calm. Always be positive and teach kids about staying healthy.
Explain medical concepts simply, share interesting health facts, and make learning about the body fun!`,

    astronaut: `You are a friendly Astronaut character in a children's educational AR app called Brighten.
You speak to kids aged 6-12. Provide detailed, engaging responses that are fun and educational.
Use simple words and add emojis occasionally to make it more engaging. You explore outer space and do amazing experiments.
Your personality: adventurous, curious, and brave. Always be positive and inspire kids to dream big about space.
Share space adventure stories, explain space science simply, and make learning about the universe exciting!`
};

const CAREER_PRESETS = {
    programmer: ["Can you tell me all about what programmers do every day? 💻", "What's the most exciting project you've ever worked on?", "How did you learn to code and what advice do you have for kids?"],
    police: ["Can you share some interesting stories about helping people in your community? 🚔", "What does a typical day look like for a police officer?", "How do you train to become a police officer and what skills are important?"],
    teacher: ["What's your favorite thing about teaching and why? 📚", "Can you share a story about a student who really inspired you?", "How do you make difficult subjects fun and easy to understand?"],
    farmer: ["Can you tell me all about life on a farm and what you do each day? 🐄", "What's the most interesting thing about growing food and caring for animals?", "How do the seasons affect your work on the farm?"],
    doctor: ["Can you explain what doctors do to help people stay healthy? 🩺", "What's the most rewarding part of being a doctor?", "How does the human body work and what are some cool facts about it?"],
    astronaut: ["Can you describe what it's really like to live and work in space? 🚀", "What was the most amazing thing you saw in space?", "How do astronauts train and prepare for space missions?"]
};

const DEFAULT_PRESETS = ["Can you tell me all about your job?", "Why is your work important for our community?", "What's the most interesting part of what you do every day?"];

// ============================================
// VISUAL EFFECTS CONFIG
// ============================================
const EFFECTS_CONFIG = {
    enableParticles: true,
    enableSoundEffects: true,
    enableTypingSound: true,
    enableEmojiExplosions: true,
    enableGlitchEffect: false,
    typingSpeed: 35,
    streamChunkSize: 3
};

// ============================================
// STATE MANAGEMENT
// ============================================
let currentCareer = null;
let conversationHistory = [];
let isWaitingForResponse = false;
let currentAbortController = null;
let audioContext = null;
let messageSoundBuffer = null;
let typingSoundBuffer = null;
let particlesCanvas = null;
let particlesCtx = null;
let particles = [];
let animationFrame = null;

// ============================================
// INITIALIZATION
// ============================================
function initChat(career) {
    currentCareer = career;
    
    const systemPrompt = CAREER_PROMPTS[career.id] || `You are a friendly ${career.name} character in a children's educational app. Keep responses short and fun for kids aged 6-12.`;
    
    conversationHistory = [
        { role: 'system', content: systemPrompt },
        { role: 'assistant', content: `Hi! I'm a ${career.name}! Ask me anything about my job! 😊` }
    ];
    
    // Update UI
    document.getElementById('chat-character-name').textContent = `💬 Chat with ${career.name}`;
    
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.innerHTML = '';
    
    // Add welcome message with typewriter effect
    addMessageWithTypewriter('assistant', `Hi! I'm a ${career.name}! Ask me anything about my job! 😊`);
    
    // Setup UI components
    setupPresetButtons(career.id);
    setupEventListeners();
    setupScrollToBottom();
    setupParticleSystem();
    initAudio();
    injectAdvancedStyles();
    
    // Focus input
    document.getElementById('chat-input').focus();
    
    // Trigger welcome particles
    if (EFFECTS_CONFIG.enableParticles) {
        burstParticles(20, '#FFD93D');
    }
}

// ============================================
// ADVANCED STYLES INJECTION
// ============================================
function injectAdvancedStyles() {
    const styleId = 'advanced-chat-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* Message animations */
        .message {
            animation: messagePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            transform-origin: bottom;
            position: relative;
            overflow: visible;
        }
        
        .message.user {
            transform-origin: bottom right;
            animation: messagePopRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }
        
        .message.assistant {
            transform-origin: bottom left;
            animation: messagePopLeft 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        @keyframes messagePop {
            from { opacity: 0; transform: scale(0.6) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        @keyframes messagePopRight {
            from { opacity: 0; transform: scale(0.6) translate(15px, 20px); }
            to { opacity: 1; transform: scale(1) translate(0, 0); }
        }
        
        @keyframes messagePopLeft {
            from { opacity: 0; transform: scale(0.6) translate(-15px, 20px); }
            to { opacity: 1; transform: scale(1) translate(0, 0); }
        }
        
        /* Typewriter cursor */
        .message.assistant.typing {
            position: relative;
        }
        
        .message.assistant.typing::after {
            content: '▊';
            animation: blinkCursor 1s infinite;
            margin-left: 3px;
            opacity: 0.8;
            color: var(--coral);
        }
        
        @keyframes blinkCursor {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
        }
        
        /* Streaming glow effect */
        .message.assistant.streaming {
            box-shadow: 0 0 20px rgba(255, 217, 61, 0.5);
            transition: box-shadow 0.3s;
        }
        
        /* Message timestamp */
        .message-time {
            font-size: 9px;
            opacity: 0.5;
            margin-top: 6px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 4px;
            font-family: var(--font-body);
        }
        
        .message.user .message-time {
            color: rgba(255,255,255,0.8);
        }
        
        .message.assistant .message-time {
            color: var(--dark);
            opacity: 0.5;
        }
        
        .message-status {
            display: inline-flex;
            align-items: center;
            gap: 2px;
        }
        
        .message-status .check {
            font-size: 12px;
        }
        
        .message-status.sent .check { opacity: 0.5; }
        .message-status.delivered .check { opacity: 0.8; }
        .message-status.read .check { 
            opacity: 1;
            color: var(--yellow);
        }
        
        /* Scroll to bottom button */
        #scroll-to-bottom {
            position: absolute;
            bottom: 120px;
            left: 50%;
            transform: translateX(-50%) scale(0.9);
            background: var(--dark);
            color: white;
            border: 2.5px solid var(--yellow);
            border-radius: 40px;
            padding: 10px 20px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            pointer-events: none;
            z-index: 150;
            box-shadow: 0 6px 20px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,217,61,0.3);
            font-family: var(--font-body);
            white-space: nowrap;
            backdrop-filter: blur(10px);
        }
        
        #scroll-to-bottom.show {
            opacity: 1;
            transform: translateX(-50%) scale(1);
            pointer-events: auto;
        }
        
        #scroll-to-bottom:hover {
            background: var(--yellow);
            color: var(--dark);
            transform: translateX(-50%) translateY(-4px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.25), 0 0 0 3px rgba(255,217,61,0.5);
        }
        
        #scroll-to-bottom:active {
            transform: translateX(-50%) translateY(-2px);
        }
        
        /* Particle canvas */
        #particle-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 50;
        }
        
        /* Typing indicator dots */
        .typing-indicator {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 12px 16px;
            background: #F0F0F0;
            border-radius: 16px;
            border-bottom-left-radius: 4px;
            max-width: 60px;
        }
        
        .typing-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--dark);
            opacity: 0.4;
            animation: typingDot 1.4s infinite ease-in-out;
        }
        
        .typing-dot:nth-child(1) { animation-delay: 0s; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes typingDot {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-8px); opacity: 1; }
        }
        
        /* Emoji explosion */
        .emoji-explosion {
            position: fixed;
            pointer-events: none;
            z-index: 9999;
            font-size: 30px;
            animation: emojiFly 1s ease-out forwards;
        }
        
        @keyframes emojiFly {
            0% { opacity: 1; transform: scale(1) translate(0, 0) rotate(0deg); }
            100% { opacity: 0; transform: scale(0.3) translate(var(--tx), var(--ty)) rotate(360deg); }
        }
        
        /* Send button pulse */
        #chat-send:not(:disabled) {
            position: relative;
            overflow: hidden;
        }
        
        #chat-send:not(:disabled)::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255,255,255,0.5);
            transform: translate(-50%, -50%);
            transition: width 0.3s, height 0.3s;
        }
        
        #chat-send:not(:disabled):active::after {
            width: 100px;
            height: 100px;
        }
        
        /* Input focus glow */
        #chat-input:focus {
            box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2), 0 4px 12px rgba(0,0,0,0.1);
        }
        
        /* Preset button enhanced */
        .preset-btn {
            position: relative;
            overflow: hidden;
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .preset-btn:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 4px 12px rgba(255, 217, 61, 0.4);
        }
        
        .preset-btn:active {
            transform: translateY(1px) scale(0.98);
        }
        
        /* Glitch effect */
        .glitch {
            animation: glitchEffect 0.3s infinite;
        }
        
        @keyframes glitchEffect {
            0%, 100% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
        }
    `;
    
    document.head.appendChild(style);
}

// ============================================
// PARTICLE SYSTEM
// ============================================
function setupParticleSystem() {
    if (!EFFECTS_CONFIG.enableParticles) return;
    
    particlesCanvas = document.createElement('canvas');
    particlesCanvas.id = 'particle-canvas';
    document.body.appendChild(particlesCanvas);
    
    particlesCtx = particlesCanvas.getContext('2d');
    
    const resizeCanvas = () => {
        particlesCanvas.width = window.innerWidth;
        particlesCanvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Particle animation loop
    function animateParticles() {
        if (!particlesCtx) return;
        
        particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
        
        particles = particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // gravity
            p.life -= p.decay;
            p.alpha = p.life * 0.5;
            
            if (p.life <= 0) return false;
            
            particlesCtx.save();
            particlesCtx.globalAlpha = p.alpha;
            particlesCtx.fillStyle = p.color;
            particlesCtx.beginPath();
            particlesCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            particlesCtx.fill();
            
            // Glow effect
            particlesCtx.shadowColor = p.color;
            particlesCtx.shadowBlur = 10;
            particlesCtx.fill();
            particlesCtx.restore();
            
            return true;
        });
        
        animationFrame = requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
}

function burstParticles(count, color, x = null, y = null) {
    if (!EFFECTS_CONFIG.enableParticles) return;
    
    const centerX = x || window.innerWidth / 2;
    const centerY = y || window.innerHeight / 2;
    
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const speed = 2 + Math.random() * 8;
        
        particles.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 4 + Math.random() * 8,
            color: color,
            life: 1,
            decay: 0.01 + Math.random() * 0.02,
            alpha: 1
        });
    }
}

// ============================================
// AUDIO SYSTEM
// ============================================
async function initAudio() {
    if (!EFFECTS_CONFIG.enableSoundEffects) return;
    
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create message sent sound
        const messageBuffer = await createBeepBuffer(800, 0.1, 'sine');
        messageSoundBuffer = messageBuffer;
        
        // Create typing sound
        const typingBuffer = await createBeepBuffer(1200, 0.02, 'sine');
        typingSoundBuffer = typingBuffer;
        
    } catch (e) {
        console.log('Audio not supported:', e);
    }
}

async function createBeepBuffer(frequency, duration, type = 'sine') {
    if (!audioContext) return null;
    
    const sampleRate = audioContext.sampleRate;
    const length = duration * sampleRate;
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-3 * t);
    }
    
    return buffer;
}

function playSound(buffer, volume = 0.3) {
    if (!audioContext || !buffer || audioContext.state !== 'running') return;
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    source.start();
}

function playTypingSound() {
    if (!EFFECTS_CONFIG.enableTypingSound) return;
    playSound(typingSoundBuffer, 0.05);
}

function playMessageSentSound() {
    playSound(messageSoundBuffer, 0.15);
}

// ============================================
// EMOJI EXPLOSION
// ============================================
function createEmojiExplosion(x, y) {
    if (!EFFECTS_CONFIG.enableEmojiExplosions) return;
    
    const emojis = ['✨', '🌟', '⭐', '💫', '🎈', '🎉', '💖', '🌈', '🦄', '🌸'];
    const count = 8;
    
    for (let i = 0; i < count; i++) {
        const emoji = document.createElement('div');
        emoji.className = 'emoji-explosion';
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        
        const angle = (Math.PI * 2 * i) / count;
        const distance = 60 + Math.random() * 60;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance - 30;
        
        emoji.style.setProperty('--tx', tx + 'px');
        emoji.style.setProperty('--ty', ty + 'px');
        emoji.style.left = x + 'px';
        emoji.style.top = y + 'px';
        
        document.body.appendChild(emoji);
        
        setTimeout(() => emoji.remove(), 1000);
    }
}

// ============================================
// UI SETUP
// ============================================
function setupPresetButtons(careerId) {
    const presetsContainer = document.getElementById('chat-presets');
    const presets = CAREER_PRESETS[careerId] || DEFAULT_PRESETS;
    
    presetsContainer.innerHTML = presets.map(preset => 
        `<button class="preset-btn" data-question="${preset.replace(/"/g, '&quot;')}">${preset}</button>`
    ).join('');
    
    presetsContainer.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (isWaitingForResponse) return;
            
            // Visual feedback
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => btn.style.transform = '', 150);
            
            const question = btn.dataset.question;
            sendMessage(question);
        });
    });
}

function setupEventListeners() {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    
    // Remove old listeners
    const newInput = input.cloneNode(true);
    const newSendBtn = sendBtn.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
    
    newInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !isWaitingForResponse) {
            const message = newInput.value.trim();
            if (message) {
                // Ripple effect on send button
                const rect = newSendBtn.getBoundingClientRect();
                burstParticles(8, '#FF6B6B', rect.left + rect.width / 2, rect.top + rect.height / 2);
                
                sendMessage(message);
                newInput.value = '';
            }
        }
    });
    
    newSendBtn.addEventListener('click', () => {
        if (isWaitingForResponse) return;
        const message = newInput.value.trim();
        if (message) {
            const rect = newSendBtn.getBoundingClientRect();
            burstParticles(8, '#FF6B6B', rect.left + rect.width / 2, rect.top + rect.height / 2);
            
            sendMessage(message);
            newInput.value = '';
        }
    });
}

function setupScrollToBottom() {
    const messagesContainer = document.getElementById('chat-messages');
    const chatUI = document.getElementById('chat-ui');
    
    const scrollBtn = document.createElement('button');
    scrollBtn.id = 'scroll-to-bottom';
    scrollBtn.innerHTML = '↓ New messages ↓';
    chatUI.style.position = 'relative';
    chatUI.appendChild(scrollBtn);
    
    messagesContainer.addEventListener('scroll', () => {
        const isNearBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 100;
        scrollBtn.classList.toggle('show', !isNearBottom);
    });
    
    scrollBtn.addEventListener('click', () => {
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
        burstParticles(10, '#FFD93D');
    });
}

// ============================================
// MESSAGE HANDLING
// ============================================
function addMessage(role, content, animate = true) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.innerHTML = formatMessage(content);
    
    // Add timestamp
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    const now = new Date();
    timeDiv.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    if (role === 'user') {
        const statusSpan = document.createElement('span');
        statusSpan.className = 'message-status sent';
        statusSpan.innerHTML = '<span class="check">✓</span>';
        timeDiv.appendChild(statusSpan);
        
        // Animate to delivered
        setTimeout(() => {
            statusSpan.className = 'message-status delivered';
            statusSpan.innerHTML = '<span class="check">✓✓</span>';
        }, 300);
    }
    
    messageDiv.appendChild(timeDiv);
    messagesContainer.appendChild(messageDiv);
    
    messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
    });
    
    return messageDiv;
}

function addMessageWithTypewriter(role, content) {
    const messageDiv = addMessage(role, '', false);
    messageDiv.classList.add('typing');
    
    const originalContent = content;
    let index = 0;
    messageDiv.innerHTML = '';
    
    return new Promise(resolve => {
        const typeNextChar = () => {
            if (index < originalContent.length) {
                messageDiv.innerHTML = formatMessage(originalContent.substring(0, index + 1));
                
                if (EFFECTS_CONFIG.enableTypingSound && index % 2 === 0) {
                    playTypingSound();
                }
                
                index++;
                setTimeout(typeNextChar, EFFECTS_CONFIG.typingSpeed);
            } else {
                messageDiv.classList.remove('typing');
                messageDiv.innerHTML = formatMessage(originalContent);
                
                // Add timestamp after typing
                const timeDiv = document.createElement('div');
                timeDiv.className = 'message-time';
                const now = new Date();
                timeDiv.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                messageDiv.appendChild(timeDiv);
                
                resolve(messageDiv);
            }
        };
        
        typeNextChar();
    });
}

function formatMessage(text) {
    // URL auto-linking
    text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: inherit; text-decoration: underline;">$1</a>');
    
    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Code
    text = text.replace(/`(.*?)`/g, '<code style="background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 6px; font-family: monospace;">$1</code>');
    
    return text;
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'message assistant typing-indicator-container';
    indicatorDiv.id = 'typing-indicator';
    indicatorDiv.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    messagesContainer.appendChild(indicatorDiv);
    messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
    });
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// ============================================
// STREAMING CHAT
// ============================================
async function sendMessage(message) {
    if (!currentCareer || isWaitingForResponse) return;
    
    // Play sound and effects
    playMessageSentSound();
    
    // Resume audio context on user interaction
    if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
    }
    
    // Add user message
    addMessage('user', message);
    conversationHistory.push({ role: 'user', content: message });
    
    // Show typing indicator
    showTypingIndicator();
    
    isWaitingForResponse = true;
    const sendBtn = document.getElementById('chat-send');
    const input = document.getElementById('chat-input');
    sendBtn.disabled = true;
    input.disabled = true;
    
    // Glitch effect on button
    if (EFFECTS_CONFIG.enableGlitchEffect) {
        sendBtn.classList.add('glitch');
        setTimeout(() => sendBtn.classList.remove('glitch'), 500);
    }
    
    try {
        // Cancel any ongoing request
        if (currentAbortController) {
            currentAbortController.abort();
        }
        currentAbortController = new AbortController();
        
        const response = await fetch(DEEPSEEK_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: DEEPSEEK_CONFIG.model,
                messages: conversationHistory,
                max_tokens: 1000,  
                temperature: 0.8,  
                stream: true 
            }),
            signal: currentAbortController.signal
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Create message bubble for streaming
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant streaming';
        messageDiv.id = 'streaming-message';
        messagesContainer.appendChild(messageDiv);
        
        // Process stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';
        let charBuffer = '';
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;
                    
                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices[0]?.delta?.content || '';
                        if (content) {
                            charBuffer += content;
                            
                            // Stream characters for typewriter effect
                            while (charBuffer.length >= EFFECTS_CONFIG.streamChunkSize) {
                                fullContent += charBuffer.slice(0, EFFECTS_CONFIG.streamChunkSize);
                                charBuffer = charBuffer.slice(EFFECTS_CONFIG.streamChunkSize);
                                
                                messageDiv.innerHTML = formatMessage(fullContent);
                                messageDiv.classList.add('typing');
                                
                                if (fullContent.length % 5 === 0) {
                                    playTypingSound();
                                }
                                
                                messagesContainer.scrollTo({
                                    top: messagesContainer.scrollHeight,
                                    behavior: 'smooth'
                                });
                                
                                await new Promise(resolve => setTimeout(resolve, 15));
                            }
                        }
                    } catch (e) {
                        // Ignore parse errors
                    }
                }
            }
        }
        
        // Flush remaining buffer
        if (charBuffer) {
            fullContent += charBuffer;
            messageDiv.innerHTML = formatMessage(fullContent);
        }
        
        // Finalize message
        messageDiv.classList.remove('typing', 'streaming');
        messageDiv.id = '';
        
        // Add timestamp
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        const now = new Date();
        timeDiv.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        messageDiv.appendChild(timeDiv);
        
        // Burst particles on complete
        const rect = messageDiv.getBoundingClientRect();
        burstParticles(15, '#4ECDC4', rect.left + rect.width / 2, rect.top + rect.height / 2);
        
        // Add to history
        conversationHistory.push({ role: 'assistant', content: fullContent });
        
        // Trim history if too long
        if (conversationHistory.length > 21) {
            conversationHistory = [
                conversationHistory[0],
                ...conversationHistory.slice(-20)
            ];
        }
        
        // Emoji explosion on complete!
        createEmojiExplosion(rect.left + rect.width / 2, rect.top);
        
    } catch (error) {
        console.error('Chat error:', error);
        removeTypingIndicator();
        
        // Fallback response
        const fallbacks = [
            "That's a great question! Let me think... 🤔",
            "Wow, you're so curious! I love talking about my job! 🌟",
            "Hmm, let me tell you more about what I do every day!",
            "That's one of my favorite things to talk about! ✨"
        ];
        const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        
        await addMessageWithTypewriter('assistant', fallback);
        conversationHistory.push({ role: 'assistant', content: fallback });
    } finally {
        isWaitingForResponse = false;
        sendBtn.disabled = false;
        input.disabled = false;
        input.focus();
        currentAbortController = null;
    }
}

// ============================================
// CLEANUP
// ============================================
window.addEventListener('beforeunload', () => {
    if (currentAbortController) {
        currentAbortController.abort();
    }
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    if (audioContext) {
        audioContext.close();
    }
    if (particlesCanvas) {
        particlesCanvas.remove();
    }
});

// ============================================
// EXPORT (for potential module use)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initChat, sendMessage };
}

console.log('✨ Brighten Chat Module Loaded - Streaming, Particles & Pure Awesomeness! ✨');
