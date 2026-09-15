




const DEEPSEEK_CONFIG = {
    apiKey: 'sk-93650c6ddcd44ea0afb4bf35096f9bb4', 
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-flash'
};




const CAREER_PROMPTS = {
    programmer: `You are a friendly Programmer character in a children's educational AR app called Brighten.
You speak to kids aged 6-12. Keep responses short (2-3 sentences), fun and educational.
Use simple words and add emojis occasionally to make it more engaging. You love coding, building apps, and solving problems.
Your personality: curious, logical, and encouraging. Always be positive and inspire kids to learn about technology.
Keep explanations short and sweet.`,

    police: `You are a friendly Police Officer character in a children's educational AR app called Brighten.
You speak to kids aged 6-12. Keep responses short (2-3 sentences), fun and educational.
Use simple words and add emojis occasionally to make it more engaging. You protect people and keep communities safe.
Your personality: brave, helpful, and kind. Always be positive and teach kids about safety and helping others.
Share quick safety tips in simple words.`,

    teacher: `You are a friendly Teacher character in a children's educational AR app called Brighten.
You speak to kids aged 6-12. Keep responses short (2-3 sentences), fun and educational.
Use simple words and add emojis occasionally to make it more engaging. You love helping children learn new things every day.
Your personality: patient, encouraging, and creative. Always be positive and inspire a love for learning.
Explain things briefly and creatively.`,

    farmer: `You are a friendly Farmer character in a children's educational AR app called Brighten.
You speak to kids aged 6-12. Keep responses short (2-3 sentences), fun and educational.
Use simple words and add emojis occasionally to make it more engaging. You grow food and care for animals on the farm.
Your personality: hardworking, connected to nature, and nurturing. Always be positive and teach kids where food comes from.
Teach about farm life in short, fun bits.`,

    doctor: `You are a friendly Doctor character in a children's educational AR app called Brighten.
You speak to kids aged 6-12. Keep responses short (2-3 sentences), fun and educational.
Use simple words and add emojis occasionally to make it more engaging. You help sick people get better and keep everyone healthy.
Your personality: caring, smart, and calm. Always be positive and teach kids about staying healthy.
Share quick health tips in simple words.`,

    astronaut: `You are a friendly Astronaut character in a children's educational AR app called Brighten.
You speak to kids aged 6-12. Keep responses short (2-3 sentences), fun and educational.
Use simple words and add emojis occasionally to make it more engaging. You explore outer space and do amazing experiments.
Your personality: adventurous, curious, and brave. Always be positive and inspire kids to dream big about space.
Share cool space facts in short bursts.`
};

const CAREER_PRESETS = {};

const DEFAULT_PRESETS = [];




const EFFECTS_CONFIG = {
    enableParticles: true,
    enableSoundEffects: true,
    enableTypingSound: true,
    enableEmojiExplosions: true,
    enableGlitchEffect: false,
    typingSpeed: 35,
    streamChunkSize: 3
};




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




function initChat(career) {
    currentCareer = career;

    const systemPrompt = CAREER_PROMPTS[career.id] || `You are a friendly ${career.name} character in a children's educational app. Keep responses medium length (6-8 sentences) and fun for kids aged 6-12.`;

    
    const localizedCareerName = (typeof I18N !== 'undefined')
      ? (I18N.t('career.' + career.id, null) || career.name)
      : career.name;

    const welcomeText = (typeof I18N !== 'undefined')
      ? I18N.t('chat.welcome', { name: localizedCareerName }).replace(/\ba(?= [AEIOUaeiou])/, 'an')
      : `Hi! I'm a ${career.name}! Ask me anything about my job! 😊`.replace(/\ba(?= [AEIOUaeiou])/, 'an');

    const inputPlaceholder = (typeof I18N !== 'undefined')
      ? I18N.t('chat.placeholder', null)
      : 'Ask me anything...';

    conversationHistory = [
        { role: 'system', content: systemPrompt },
        { role: 'assistant', content: welcomeText }
    ];

    
    const chatNameT = (typeof I18N !== 'undefined') ? I18N.t : (k) => k;
    document.getElementById('chat-character-name').textContent = chatNameT('chat.header', { name: localizedCareerName }) || `馃挰 Chat with ${career.name}`;

    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.innerHTML = '';

    
    addMessageWithTypewriter('assistant', welcomeText, false);

    
    const input = document.getElementById('chat-input');
    if (input) input.placeholder = inputPlaceholder;
    const fsInput = document.getElementById('fullscreen-input');
    if (fsInput) fsInput.placeholder = inputPlaceholder;

    
    setupPresetButtons(career.id);
    setupEventListeners();
    setupScrollToBottom();
    setupParticleSystem();
    initAudio();
    injectAdvancedStyles();

    
    document.getElementById('chat-input').focus();

    
    if (EFFECTS_CONFIG.enableParticles) {
        burstParticles(20, '#FFD93D');
    }
}




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
            content: '鈻?;
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
            transition: all 0.15s ease;
        }

        .preset-btn:hover {
            box-shadow: 0 4px 12px rgba(255, 217, 61, 0.4);
            background: #FFF9C4;
        }

        .preset-btn:active {
            background: var(--yellow);
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

    
    function animateParticles() {
        if (!particlesCtx) return;

        particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

        particles = particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; 
            p.life -= p.decay;
            p.alpha = p.life * 0.5;

            if (p.life <= 0) return false;

            particlesCtx.save();
            particlesCtx.globalAlpha = p.alpha;
            particlesCtx.fillStyle = p.color;
            particlesCtx.beginPath();
            particlesCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            particlesCtx.fill();

            
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




async function initAudio() {
    if (!EFFECTS_CONFIG.enableSoundEffects) return;

    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        
        const messageBuffer = await createRichSound([
            { freq: 660, duration: 0.05, type: 'sine', decay: 8, volume: 0.5 },
            { freq: 880, duration: 0.1, type: 'sine', decay: 5, volume: 0.7 },
            { freq: 1100, duration: 0.2, type: 'sine', decay: 3.5, volume: 0.6 },
            { freq: 1320, duration: 0.28, type: 'sine', decay: 2.5, volume: 0.4 },
            { freq: 1760, duration: 0.1, type: 'triangle', decay: 6, volume: 0.15 },
        ]);
        messageSoundBuffer = messageBuffer;

        
        const typingBuffer = await createRichSound([
            { freq: 880, duration: 0.03, type: 'sine', decay: 20, volume: 0.35 },
            { freq: 1320, duration: 0.02, type: 'triangle', decay: 25, volume: 0.15 },
        ]);
        typingSoundBuffer = typingBuffer;

    } catch (e) {
        console.log('Audio not supported:', e);
    }
}

async function createRichSound(layers) {
    if (!audioContext) return null;

    const sampleRate = audioContext.sampleRate;
    let maxLength = 0;
    for (const layer of layers) {
        maxLength = Math.max(maxLength, Math.ceil(layer.duration * sampleRate));
    }
    const buffer = audioContext.createBuffer(1, maxLength, sampleRate);
    const data = buffer.getChannelData(0);

    for (const layer of layers) {
        const length = Math.min(Math.ceil(layer.duration * sampleRate), maxLength);
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            let sample = 0;
            switch (layer.type) {
                case 'sine':
                    sample = Math.sin(2 * Math.PI * layer.freq * t);
                    break;
                case 'triangle':
                    sample = 2 * Math.abs(2 * (t * layer.freq - Math.floor(t * layer.freq + 0.5))) - 1;
                    break;
                case 'square':
                    sample = Math.sin(2 * Math.PI * layer.freq * t) > 0 ? 1 : -1;
                    break;
            }
            data[i] += sample * Math.exp(-layer.decay * t) * (layer.volume || 1);
        }
    }

    
    let maxVal = 0;
    for (let i = 0; i < maxLength; i++) {
        maxVal = Math.max(maxVal, Math.abs(data[i]));
    }
    if (maxVal > 0) {
        for (let i = 0; i < maxLength; i++) {
            data[i] /= maxVal;
        }
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




function createEmojiExplosion(x, y) {
    if (!EFFECTS_CONFIG.enableEmojiExplosions) return;

    const emojis = ['🌟', '🎉', '✨', '🎊', '💫', '⭐', '🌈', '🔥', '💥', '🎯'];
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




function setupPresetButtons(careerId) {
    const presetsContainer = document.getElementById('chat-presets');
    const pt = (typeof I18N !== 'undefined') ? I18N.t : (k) => k;

    
    const presets = [0, 1, 2].map(i => {
      const key = 'preset.' + careerId + '.' + i;
      return pt(key, null);
    }).filter(Boolean);

    if (presets.length === 0) {
      
      [0, 1, 2].forEach(i => {
        const key = 'preset.default.' + i;
        const val = pt(key, null);
        if (val) presets.push(val);
      });
    }

    presetsContainer.innerHTML = presets.map(preset =>
        `<button class="preset-btn" data-question="${preset.replace(/"/g, '&quot;')}">${preset}</button>`
    ).join('');

    presetsContainer.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (isWaitingForResponse) return;

            
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

    
    const newInput = input.cloneNode(true);
    const newSendBtn = sendBtn.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);

    newInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !isWaitingForResponse) {
            const message = newInput.value.trim();
            if (message) {
                
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
    scrollBtn.innerHTML = '⬆️ New messages ⬆️';
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




function addMessage(role, content, animate = true) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.innerHTML = formatMessage(content);

    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    const now = new Date();
    timeDiv.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (role === 'user') {
        const statusSpan = document.createElement('span');
        statusSpan.className = 'message-status sent';
        statusSpan.innerHTML = '<span class="check">鉁?/span>';
        timeDiv.appendChild(statusSpan);

        
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

function addMessageWithTypewriter(role, content, showTimestamp = true) {
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

                
                if (showTimestamp) {
                    const timeDiv = document.createElement('div');
                    timeDiv.className = 'message-time';
                    const now = new Date();
                    timeDiv.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    messageDiv.appendChild(timeDiv);
                }

                resolve(messageDiv);
            }
        };

        typeNextChar();
    });
}

function formatMessage(text) {
    
    text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: inherit; text-decoration: underline;">$1</a>');

    
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

    
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




async function sendMessage(message) {
    if (!currentCareer || isWaitingForResponse) return;

    
    playMessageSentSound();

    
    if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
    }

    
    addMessage('user', message);
    conversationHistory.push({ role: 'user', content: message });

    
    showTypingIndicator();

    isWaitingForResponse = true;
    const sendBtn = document.getElementById('chat-send');
    const input = document.getElementById('chat-input');
    sendBtn.disabled = true;
    input.disabled = true;

    
    if (EFFECTS_CONFIG.enableGlitchEffect) {
        sendBtn.classList.add('glitch');
        setTimeout(() => sendBtn.classList.remove('glitch'), 500);
    }

    try {
        
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
                stream: true,
                reasoning_effort: 'none' 
            }),
            signal: currentAbortController.signal
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        
        removeTypingIndicator();

        
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant streaming';
        messageDiv.id = 'streaming-message';
        messagesContainer.appendChild(messageDiv);

        
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
                        
                    }
                }
            }
        }

        
        if (charBuffer) {
            fullContent += charBuffer;
            messageDiv.innerHTML = formatMessage(fullContent);
        }

        
        messageDiv.classList.remove('typing', 'streaming');
        messageDiv.id = '';

        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        const now = new Date();
        timeDiv.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        messageDiv.appendChild(timeDiv);

        
        const rect = messageDiv.getBoundingClientRect();
        burstParticles(15, '#4ECDC4', rect.left + rect.width / 2, rect.top + rect.height / 2);

        
        conversationHistory.push({ role: 'assistant', content: fullContent });

        
        if (conversationHistory.length > 21) {
            conversationHistory = [
                conversationHistory[0],
                ...conversationHistory.slice(-20)
            ];
        }

        
        createEmojiExplosion(rect.left + rect.width / 2, rect.top);

    } catch (error) {
        console.error('Chat error:', error);
        removeTypingIndicator();

        
        const fallbackT = (typeof I18N !== 'undefined') ? I18N.t : (k) => '';
        const fallbacks = [
            fallbackT('chat.fallback1', null) || "That's a great question! Let me think... 馃",
            fallbackT('chat.fallback2', null) || "Wow, you're so curious! I love talking about my job! 馃専",
            fallbackT('chat.fallback3', null) || "Hmm, let me tell you more about what I do every day!",
            fallbackT('chat.fallback4', null) || "That's one of my favorite things to talk about! 🌟"
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




if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initChat, sendMessage };
}

console.log('⭐Brighten Chat Module Loaded - Streaming, Particles & Pure Awesomeness! ⭐');
