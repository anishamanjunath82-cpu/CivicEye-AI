let chatOpen = false;
let chatHistory = [];

export function initChatbot() {
  createChatWidget();
}

function createChatWidget() {
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'civiceye-chat-widget';
  widgetContainer.style.position = 'fixed';
  widgetContainer.style.bottom = '20px';
  widgetContainer.style.left = '20px';
  widgetContainer.style.zIndex = '9999';
  widgetContainer.style.fontFamily = 'Inter, sans-serif';

  const chatBtn = document.createElement('button');
  chatBtn.innerHTML = '🤖';
  chatBtn.style.width = '60px';
  chatBtn.style.height = '60px';
  chatBtn.style.borderRadius = '50%';
  chatBtn.style.backgroundColor = '#00d4aa';
  chatBtn.style.border = 'none';
  chatBtn.style.fontSize = '30px';
  chatBtn.style.cursor = 'pointer';
  chatBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
  chatBtn.style.transition = 'transform 0.2s';
  chatBtn.onmouseover = () => chatBtn.style.transform = 'scale(1.05)';
  chatBtn.onmouseout = () => chatBtn.style.transform = 'scale(1)';

  const chatPanel = document.createElement('div');
  chatPanel.style.display = 'flex';
  chatPanel.style.flexDirection = 'column';
  chatPanel.style.position = 'absolute';
  chatPanel.style.bottom = '80px';
  chatPanel.style.left = '0';
  chatPanel.style.width = '350px';
  chatPanel.style.height = '450px';
  chatPanel.style.backgroundColor = '#1e1e2d';
  chatPanel.style.borderRadius = '12px';
  chatPanel.style.boxShadow = '0 8px 24px rgba(0,0,0,0.6)';
  chatPanel.style.overflow = 'hidden';
  chatPanel.style.opacity = '0';
  chatPanel.style.pointerEvents = 'none';
  chatPanel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  chatPanel.style.transform = 'translateY(20px)';
  chatPanel.style.border = '1px solid #363653';

  // Header
  const header = document.createElement('div');
  header.style.backgroundColor = '#2a2a3f';
  header.style.color = '#fff';
  header.style.padding = '15px';
  header.style.fontWeight = 'bold';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.innerHTML = '<span data-i18n="askCivicEye">Ask CivicEye 🤖</span>';
  
  const closeBtn = document.createElement('span');
  closeBtn.innerHTML = '✕';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.opacity = '0.7';
  closeBtn.onmouseover = () => closeBtn.style.opacity = '1';
  closeBtn.onmouseout = () => closeBtn.style.opacity = '0.7';
  header.appendChild(closeBtn);
  chatPanel.appendChild(header);

  // Messages area
  const messagesArea = document.createElement('div');
  messagesArea.id = 'chat-messages';
  messagesArea.style.flex = '1';
  messagesArea.style.padding = '15px';
  messagesArea.style.overflowY = 'auto';
  messagesArea.style.display = 'flex';
  messagesArea.style.flexDirection = 'column';
  messagesArea.style.gap = '12px';
  chatPanel.appendChild(messagesArea);

  // Input area
  const inputArea = document.createElement('div');
  inputArea.style.padding = '15px';
  inputArea.style.backgroundColor = '#2a2a3f';
  inputArea.style.display = 'flex';
  inputArea.style.gap = '10px';
  
  const inputField = document.createElement('input');
  inputField.type = 'text';
  inputField.placeholder = 'Ask about your area...';
  inputField.setAttribute('data-i18n-placeholder', 'chatPlaceholder');
  inputField.style.flex = '1';
  inputField.style.padding = '10px 15px';
  inputField.style.borderRadius = '20px';
  inputField.style.border = '1px solid #363653';
  inputField.style.outline = 'none';
  inputField.style.backgroundColor = '#1e1e2d';
  inputField.style.color = '#fff';
  inputField.style.fontFamily = 'inherit';

  const sendBtn = document.createElement('button');
  sendBtn.innerHTML = '➤';
  sendBtn.style.backgroundColor = '#00d4aa';
  sendBtn.style.border = 'none';
  sendBtn.style.borderRadius = '50%';
  sendBtn.style.width = '38px';
  sendBtn.style.height = '38px';
  sendBtn.style.color = '#1e1e2d';
  sendBtn.style.cursor = 'pointer';
  sendBtn.style.display = 'flex';
  sendBtn.style.alignItems = 'center';
  sendBtn.style.justifyContent = 'center';

  inputArea.appendChild(inputField);
  inputArea.appendChild(sendBtn);
  chatPanel.appendChild(inputArea);

  widgetContainer.appendChild(chatPanel);
  widgetContainer.appendChild(chatBtn);
  document.body.appendChild(widgetContainer);

  const toggleChat = () => {
    chatOpen = !chatOpen;
    chatPanel.style.opacity = chatOpen ? '1' : '0';
    chatPanel.style.pointerEvents = chatOpen ? 'all' : 'none';
    chatPanel.style.transform = chatOpen ? 'translateY(0)' : 'translateY(20px)';
    if (chatOpen) inputField.focus();
  };

  chatBtn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  const handleSend = () => {
    const text = inputField.value.trim();
    if (text) {
      sendMessage(text);
      inputField.value = '';
    }
  };

  sendBtn.addEventListener('click', handleSend);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  // Initial welcome message
  addMessage("Hi! I'm CivicEye AI. Ask me about detected waste, local reports, or cleanup routing.", 'ai');
}

async function sendMessage(question) {
  addMessage(question, 'user');
  
  const typingId = 'typing-' + Date.now();
  addMessage('Typing...', 'ai', typingId);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history: chatHistory })
    });
    
    // Remove typing indicator
    const typingMsg = document.getElementById(typingId);
    if (typingMsg) typingMsg.remove();
    
    if (res.ok) {
      const data = await res.json();
      addMessage(data.answer, 'ai');
      chatHistory.push({ role: 'user', content: question });
      chatHistory.push({ role: 'assistant', content: data.answer });
    } else {
      addMessage('Sorry, I encountered an error analyzing your request.', 'ai');
    }
  } catch (err) {
    console.error('Chat error:', err);
    const typingMsg = document.getElementById(typingId);
    if (typingMsg) typingMsg.remove();
    addMessage('Connection error. Is the server running?', 'ai');
  }
}

function addMessage(text, sender, id = null) {
  const messagesArea = document.getElementById('chat-messages');
  if (!messagesArea) return;

  const bubbleWrapper = document.createElement('div');
  bubbleWrapper.style.display = 'flex';
  bubbleWrapper.style.width = '100%';
  bubbleWrapper.style.justifyContent = sender === 'user' ? 'flex-end' : 'flex-start';

  const bubble = document.createElement('div');
  if (id) bubbleWrapper.id = id;
  bubble.textContent = text;
  bubble.style.padding = '10px 14px';
  bubble.style.borderRadius = '16px';
  bubble.style.maxWidth = '85%';
  bubble.style.wordWrap = 'break-word';
  bubble.style.fontSize = '14px';
  bubble.style.lineHeight = '1.4';
  
  if (sender === 'user') {
    bubble.style.backgroundColor = '#00d4aa';
    bubble.style.color = '#1e1e2d';
    bubble.style.borderBottomRightRadius = '4px';
  } else {
    bubble.style.backgroundColor = '#363653';
    bubble.style.color = '#fff';
    bubble.style.borderBottomLeftRadius = '4px';
  }

  bubbleWrapper.appendChild(bubble);
  messagesArea.appendChild(bubbleWrapper);
  messagesArea.scrollTop = messagesArea.scrollHeight;
}

export default { initChatbot };
